import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { StudyGroup } from '../models/StudyGroup';
import { Subject } from '../models/Academic';

export const getStudyGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.query;
    const filter: any = {};
    if (subjectId) filter.subjectId = subjectId;

    let groups = await StudyGroup.find(filter)
      .populate('subjectId', 'name code semester')
      .populate('ownerId', 'name avatarUrl reputationPoints')
      .sort({ createdAt: -1 })
      .lean();

    // Default seed if empty
    if (groups.length === 0) {
      const subject = await Subject.findOne();
      if (subject) {
        const defaultGroup = await StudyGroup.create({
          name: `${subject.code} — Mid-Semester Exam Circle`,
          subjectId: subject._id,
          ownerId: subject.branchId, // placeholder ref
          visibility: 'public',
          schedule: 'Daily 7:00 PM - 9:00 PM IST',
          activeTopic: 'Unit 2 & 3 Problem Solving and Proofs',
          memberIds: [],
        });
        groups = [defaultGroup.toObject() as any];
      }
    }

    res.json({ success: true, data: groups });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createStudyGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to create a study group.' },
      });
      return;
    }
    const ownerId = req.user._id;
    const { name, subjectId, schedule, activeTopic, visibility = 'public' } = req.body;

    const group = await StudyGroup.create({
      name,
      subjectId,
      ownerId,
      schedule: schedule || 'Mon, Wed, Fri 6:00 PM IST',
      activeTopic: activeTopic || 'Exam Preparation & Doubt Clearance',
      visibility,
      memberIds: [ownerId],
      messages: [],
    });

    res.status(201).json({ success: true, data: group });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const joinStudyGroup = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { id } = req.params;
    const group = await StudyGroup.findById(id);

    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Study room not found' } });
      return;
    }

    if (!group.memberIds.some((m) => m.toString() === req.user!._id.toString())) {
      group.memberIds.push(req.user._id);
      await group.save();
    }

    res.json({
      success: true,
      data: {
        message: 'Successfully joined study circle.',
        group,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getRoomMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const group = await StudyGroup.findById(id).select('name messages activeTopic schedule');
    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Study room not found' } });
      return;
    }
    res.json({ success: true, data: group.messages || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const postRoomMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: { message: 'Message text is required' } });
      return;
    }

    const group = await StudyGroup.findById(id);
    if (!group) {
      res.status(404).json({ success: false, error: { message: 'Study room not found' } });
      return;
    }

    const senderName = req.user?.name || req.supabaseUser?.email?.split('@')[0] || 'Peer Student';
    const senderRole = req.user?.role || 'student';
    const senderId = req.user?._id?.toString() || req.supabaseUser?.id || 'anon-peer';

    const newMessage = {
      senderId,
      senderName,
      senderRole,
      text: text.trim(),
      createdAt: new Date(),
    };

    group.messages.push(newMessage as any);
    await group.save();

    res.status(201).json({ success: true, data: newMessage });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
