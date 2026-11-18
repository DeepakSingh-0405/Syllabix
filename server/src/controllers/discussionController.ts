import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Discussion, Comment } from '../models/Discussion';
import { User } from '../models/User';

export const getDiscussions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.query;
    const filter: any = {};
    if (subjectId) filter.subjectId = subjectId;

    const discussions = await Discussion.find(filter)
      .populate('authorId', 'name avatarUrl reputationPoints')
      .populate('subjectId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: discussions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const createDiscussion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user?._id || '650000000000000000000001';
    const { subjectId, title, body, tags } = req.body;
    const discussion = await Discussion.create({
      subjectId,
      authorId,
      title,
      body,
      tags: tags || [],
    });

    res.status(201).json({ success: true, data: discussion });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const addComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const authorId = req.user?._id || '650000000000000000000001';
    const { id } = req.params; // discussionId
    const { body } = req.body;

    const comment = await Comment.create({
      discussionId: id,
      authorId,
      body,
    });

    await Discussion.findByIdAndUpdate(id, { $inc: { commentCount: 1 } });

    res.status(201).json({ success: true, data: comment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const acceptAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { id } = req.params; // discussionId
    const { commentId } = req.body;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      res.status(404).json({ success: false, error: { message: 'Discussion not found' } });
      return;
    }

    if (String(discussion.authorId) !== String(req.user._id)) {
      res.status(403).json({ success: false, error: { message: 'Only question author can accept an answer' } });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ success: false, error: { message: 'Comment not found' } });
      return;
    }

    comment.isAcceptedAnswer = true;
    await comment.save();

    discussion.status = 'resolved';
    discussion.acceptedAnswerId = comment._id as any;
    await discussion.save();

    // Reward helpful peer/mentor with reputation points (+15 points)
    await User.findByIdAndUpdate(comment.authorId, { $inc: { reputationPoints: 15 } });

    res.json({
      success: true,
      data: {
        message: 'Answer marked as accepted. Peer awarded +15 reputation points.',
        discussion,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
