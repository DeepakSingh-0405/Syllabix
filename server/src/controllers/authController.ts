import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';

/**
 * Retrieves the current authenticated user's profile.
 * Automatically bootstraps and initializes a MongoDB user record on first login if one does not exist.
 */
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let user = req.user;

    // If user is missing in req.user but supabaseUser is authenticated, bootstrap record
    if (!user && req.supabaseUser) {
      try {
        let dbUser = await User.findOne({ supabaseUserId: req.supabaseUser.id });
        if (!dbUser) {
          dbUser = await User.create({
            supabaseUserId: req.supabaseUser.id,
            email: req.supabaseUser.email || '',
            name: req.supabaseUser.user_metadata?.full_name || req.supabaseUser.email?.split('@')[0] || 'Student',
            avatarUrl: req.supabaseUser.user_metadata?.avatar_url || '',
            role: 'student',
            reputationPoints: 0,
          });
        }
        user = dbUser;
      } catch (dbErr) {
        console.warn('[AuthController] Mongo bootstrap error in getMe (offline/mock):', dbErr);
        user = {
          _id: new mongoose.Types.ObjectId('650000000000000000000001'),
          supabaseUserId: req.supabaseUser.id,
          email: req.supabaseUser.email || 'student@syllabix.edu',
          name: req.supabaseUser.user_metadata?.full_name || req.supabaseUser.email?.split('@')[0] || 'Student',
          avatarUrl: req.supabaseUser.user_metadata?.avatar_url || '',
          role: 'student',
          reputationPoints: 0,
        } as any;
      }
    }

    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User profile not found' } });
      return;
    }

    // Populate academic institution and branch if available
    let userProfile = user;
    if (user._id && mongoose.Types.ObjectId.isValid(user._id.toString())) {
      try {
        const populated = await User.findById(user._id)
          .populate('institutionId', 'name code')
          .populate('branchId', 'name code')
          .lean();
        if (populated) {
          userProfile = populated as any;
        }
      } catch (err) {
        // Fall back to existing user object if query fails
      }
    }

    res.json({
      success: true,
      data: userProfile,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

/**
 * Explicitly synchronizes and initializes a user profile after Supabase authentication.
 */
export const syncProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const supabaseId = req.supabaseUser?.id || req.body.supabaseUserId;
    const email = req.supabaseUser?.email || req.body.email;
    const name = req.body.name || req.supabaseUser?.user_metadata?.full_name || email?.split('@')[0] || 'Student';
    const avatarUrl = req.body.avatarUrl || req.supabaseUser?.user_metadata?.avatar_url || '';

    if (!supabaseId) {
      res.status(400).json({ success: false, error: { message: 'Supabase User ID is required' } });
      return;
    }

    let user: any = null;
    try {
      user = await User.findOne({ supabaseUserId: supabaseId });
      if (!user) {
        user = await User.create({
          supabaseUserId: supabaseId,
          email: email || '',
          name,
          avatarUrl,
          role: 'student',
          reputationPoints: 0,
        });
      } else {
        // Update name/avatar if they were default
        let shouldSave = false;
        if (name && (user.name === 'Student' || !user.name) && name !== 'Student') {
          user.name = name;
          shouldSave = true;
        }
        if (avatarUrl && !user.avatarUrl) {
          user.avatarUrl = avatarUrl;
          shouldSave = true;
        }
        if (shouldSave) {
          await user.save();
        }
      }
    } catch (dbErr) {
      console.warn('[AuthController] Mongo error in syncProfile:', dbErr);
      user = {
        _id: new mongoose.Types.ObjectId('650000000000000000000001'),
        supabaseUserId: supabaseId,
        email: email || 'student@syllabix.edu',
        name,
        avatarUrl,
        role: 'student',
        reputationPoints: 0,
      };
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

/**
 * Updates academic profile information (name, institution, branch, semester, avatar).
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { name, institutionId, branchId, semester, avatarUrl } = req.body;

    const updateFields: any = {};
    if (name && typeof name === 'string') updateFields.name = name.trim();
    if (avatarUrl && typeof avatarUrl === 'string') updateFields.avatarUrl = avatarUrl.trim();
    if (institutionId && mongoose.Types.ObjectId.isValid(institutionId)) updateFields.institutionId = institutionId;
    if (branchId && mongoose.Types.ObjectId.isValid(branchId)) updateFields.branchId = branchId;
    if (semester !== undefined && semester !== null) {
      const semNum = Number(semester);
      if (!isNaN(semNum) && semNum >= 1 && semNum <= 12) {
        updateFields.semester = semNum;
      }
    }

    let updatedUser: any = null;
    try {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updateFields,
        { new: true }
      )
        .populate('institutionId', 'name code')
        .populate('branchId', 'name code');
    } catch (dbErr) {
      console.warn('[AuthController] Mongo error in updateProfile (offline/mock):', dbErr);
      updatedUser = {
        ...req.user,
        ...updateFields,
      };
    }

    res.json({
      success: true,
      data: updatedUser || req.user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
