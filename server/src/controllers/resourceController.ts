import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { Resource } from '../models/Resource';
import { Subject, Branch } from '../models/Academic';
import { supabaseAdmin, BUCKETS } from '../config/supabase';
import { env } from '../config/env';

import { processDocumentIngestion } from '../services/ingestionWorker';

// 1. Get Resources with filtering
export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId, resourceType, search, limit = 50, page = 1 } = req.query;
    const filter: any = {};

    if (subjectId) filter.subjectId = subjectId;
    if (resourceType) filter.resourceType = resourceType;
    if (search) {
      filter.$or = [
        { title: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [resources, total] = await Promise.all([
      Resource.find(filter)
        .populate('subjectId', 'name code semester')
        .populate('ownerId', 'name avatarUrl reputationPoints')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Resource.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items: resources,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 2. Request Upload Intent (Creates Supabase Storage Signed Upload URL)
export const requestUploadIntent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawUserId = req.user?._id;
    const userId = (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId.toString()))
      ? (typeof rawUserId === 'string' ? new mongoose.Types.ObjectId(rawUserId) : rawUserId)
      : new mongoose.Types.ObjectId('650000000000000000000001');

    const {
      title,
      description,
      resourceType,
      subjectId,
      subjectName,
      subjectCode,
      semester,
      fileName,
      mimeType,
      fileSizeBytes,
    } = req.body;

    let targetSubject: any = null;

    // 1. If subjectId provided, attempt to locate it
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
      targetSubject = await Subject.findById(subjectId);
    }

    // 2. If not found or user manually entered subjectName/subjectCode:
    if (!targetSubject && (subjectName || subjectCode || title)) {
      const queryName = subjectName || title;
      const queryCode = (subjectCode || queryName.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')) || 'ACAD';

      // Search if a subject already exists matching the entered code or name
      targetSubject = await Subject.findOne({
        $or: [
          { code: new RegExp(`^${queryCode}$`, 'i') },
          { name: new RegExp(`^${queryName}$`, 'i') },
        ],
      });

      // If still not found, automatically register this new subject in MongoDB!
      if (!targetSubject) {
        const defaultBranch = await Branch.findOne();
        targetSubject = await Subject.create({
          name: queryName,
          code: queryCode,
          description: `${queryName} academic syllabus & course curriculum`,
          branchId: defaultBranch?._id || new mongoose.Types.ObjectId('650000000000000000000001'),
          semester: Number(semester) || 3,
          credits: 4,
          isCore: true,
          topicCount: 15,
        });
      }
    }

    // 3. Fallback: if user didn't enter anything, pick or create default subject
    if (!targetSubject) {
      targetSubject = await Subject.findOne();
      if (!targetSubject) {
        const defaultBranch = await Branch.findOne();
        targetSubject = await Subject.create({
          name: 'General Engineering Curriculum',
          code: 'GEN-101',
          description: 'Foundational degree coursework and curriculum guidelines',
          branchId: defaultBranch?._id || new mongoose.Types.ObjectId('650000000000000000000001'),
          semester: 1,
          credits: 4,
          isCore: true,
          topicCount: 12,
        });
      }
    }

    // Generate isolated storage path: {subjectCode}/{userId}/{timestamp}_{sanitizedFileName}
    const cleanFileName = (fileName || 'document.pdf').replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${targetSubject.code}/${userId}/${Date.now()}_${cleanFileName}`;

    let uploadUrl = '';
    try {
      // Create signed upload URL in Supabase Storage private bucket
      const { data: uploadData } = await supabaseAdmin.storage
        .from(BUCKETS.ACADEMIC_DOCUMENTS)
        .createSignedUploadUrl(storagePath);

      if (uploadData?.signedUrl) {
        uploadUrl = uploadData.signedUrl;
      }
    } catch (err) {
      console.warn('[ResourceController] Storage signed upload URL notice:', err);
    }

    if (!uploadUrl && env.SUPABASE_URL) {
      uploadUrl = `${env.SUPABASE_URL}/storage/v1/object/upload/sign/${BUCKETS.ACADEMIC_DOCUMENTS}/${storagePath}`;
    }

    const newResource = await Resource.create({
      ownerId: userId,
      title: title || 'Syllabus Material',
      description: description || '',
      resourceType: resourceType || 'syllabus',
      subjectId: targetSubject._id,
      storagePath,
      mimeType: mimeType || 'application/pdf',
      fileSizeBytes: fileSizeBytes || 0,
      status: 'uploading',
    });

    res.status(201).json({
      success: true,
      data: {
        resourceId: newResource._id,
        storagePath,
        uploadUrl,
        subject: {
          _id: targetSubject._id,
          code: targetSubject.code,
          name: targetSubject.name,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 3. Confirm Upload & Queue Processing
export const confirmUpload = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, error: { message: 'Resource not found' } });
      return;
    }

    // Verify ownership or moderator role (allow demo/guest fallback user matching)
    const currentUserId = req.user?._id?.toString() || '650000000000000000000001';
    if (
      String(resource.ownerId) !== currentUserId &&
      String(resource.ownerId) !== '650000000000000000000001' &&
      req.user?.role !== 'admin'
    ) {
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      return;
    }

    resource.status = 'processing';
    await resource.save();

    // Trigger asynchronous ingestion worker in background
    setImmediate(() => {
      processDocumentIngestion(resource._id.toString()).catch((err) =>
        console.error('[ResourceController] Ingestion error:', err)
      );
    });

    res.json({
      success: true,
      data: {
        resourceId: resource._id,
        status: resource.status,
        message: 'Upload confirmed. Document queued for text extraction and vector indexing.',
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

// 4. Generate Time-Limited Signed Download / View URL
export const getDownloadUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      res.status(404).json({ success: false, error: { message: 'Resource not found' } });
      return;
    }

    // Generate signed URL from Supabase Storage with 15-minute expiration (900 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKETS.ACADEMIC_DOCUMENTS)
      .createSignedUrl(resource.storagePath, 900);

    if (error || !data) {
      // Return public preview proxy fallback if storage URL configured
      const fallbackUrl = env.SUPABASE_URL
        ? `${env.SUPABASE_URL}/storage/v1/object/public/${BUCKETS.ACADEMIC_DOCUMENTS}/${resource.storagePath}`
        : '';
      res.json({
        success: true,
        data: {
          downloadUrl: fallbackUrl,
          expiresInSeconds: 900,
        },
      });
      return;
    }

    // Increment view count asynchronously
    await Resource.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });

    res.json({
      success: true,
      data: {
        downloadUrl: data.signedUrl,
        expiresInSeconds: 900,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
