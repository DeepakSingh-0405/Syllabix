import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { MentorProfile, MentorshipRequest } from '../models/Mentorship';
import { Notification } from '../models/Notification';
import { User } from '../models/User';
import { Subject } from '../models/Academic';
import { seedDatabase } from '../config/seed';

export const getMentors = async (_req: Request, res: Response): Promise<void> => {
  try {
    let mentors = await MentorProfile.find()
      .populate('userId', 'name email avatarUrl reputationPoints')
      .populate('expertiseSubjectIds', 'name code semester')
      .lean();

    if (mentors.length === 0) {
      await seedDatabase().catch(() => null);
      mentors = await MentorProfile.find()
        .populate('userId', 'name email avatarUrl reputationPoints')
        .populate('expertiseSubjectIds', 'name code semester')
        .lean();
    }

    res.json({ success: true, data: mentors });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const requestMentorship = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to request mentorship.' },
      });
      return;
    }
    const studentId = req.user._id;
    const { mentorUserId, subjectId, message, scheduledAt } = req.body;

    const request = await MentorshipRequest.create({
      mentorId: mentorUserId,
      studentId,
      subjectId,
      message,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 86400000),
      status: 'pending',
      messages: [
        {
          senderId: studentId.toString(),
          senderName: req.user?.name || 'Student Mentee',
          text: message,
          createdAt: new Date(),
        },
      ],
    });

    // Create Notification for the Mentor
    await Notification.create({
      userId: mentorUserId,
      type: 'mentorship_request',
      title: 'New Mentorship Request',
      message: `${req.user?.name || 'A student'} requested a 1-on-1 guidance session: "${message.slice(0, 80)}..."`,
      payloadJson: { requestId: request._id },
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Mentorship request submitted. The mentor has been notified.',
        request,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getMyRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const requests = await MentorshipRequest.find({
      $or: [{ studentId: req.user._id }, { mentorId: req.user._id }],
    })
      .populate('studentId', 'name avatarUrl reputationPoints')
      .populate('mentorId', 'name avatarUrl')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: requests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, error: { message: 'Request not found' } });
      return;
    }

    if (String(request.mentorId) !== String(req.user._id)) {
      res.status(403).json({ success: false, error: { message: 'Only the requested mentor can update status' } });
      return;
    }

    request.status = status;
    await request.save();

    // Notify Student
    if (status === 'accepted') {
      await Notification.create({
        userId: request.studentId,
        type: 'mentorship_accepted',
        title: 'Mentorship Session Confirmed!',
        message: `${req.user.name} accepted your study session request. Check your schedule.`,
        payloadJson: { requestId: request._id },
      });
    }

    res.json({ success: true, data: request });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const getMentorshipMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to access mentorship messages.' },
      });
      return;
    }

    const { id } = req.params;
    const request = await MentorshipRequest.findById(id).select('messages status scheduledAt message studentId mentorId');
    if (!request) {
      res.status(404).json({ success: false, error: { message: 'Mentorship session not found' } });
      return;
    }

    const currentUserId = String(req.user._id);
    const isParticipant =
      String(request.studentId) === currentUserId ||
      String(request.mentorId) === currentUserId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. You are not an authorized participant in this mentorship session.' },
      });
      return;
    }

    res.json({ success: true, data: request.messages || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const postMentorshipMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to send mentorship messages.' },
      });
      return;
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400).json({ success: false, error: { message: 'Message text is required' } });
      return;
    }

    const request = await MentorshipRequest.findById(id);
    if (!request) {
      res.status(404).json({ success: false, error: { message: 'Mentorship session not found' } });
      return;
    }

    const currentUserId = String(req.user._id);
    const isParticipant =
      String(request.studentId) === currentUserId ||
      String(request.mentorId) === currentUserId;

    if (!isParticipant) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. Only authorized participants can send messages in this session.' },
      });
      return;
    }

    if (request.status === 'declined') {
      res.status(400).json({
        success: false,
        error: { message: 'Cannot send messages to a declined mentorship session.' },
      });
      return;
    }

    const senderName = req.user.name || req.supabaseUser?.email?.split('@')[0] || 'Scholar';
    const senderId = currentUserId;

    const newMessage = {
      senderId,
      senderName,
      text: text.trim(),
      createdAt: new Date(),
    };

    request.messages.push(newMessage as any);
    await request.save();

    res.status(201).json({ success: true, data: newMessage });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
