import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Discussion, Comment } from '../models/Discussion';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

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
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to create a discussion.' },
      });
      return;
    }
    const authorId = req.user._id;
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
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to post a comment.' },
      });
      return;
    }
    const authorId = req.user._id;
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
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required to accept an answer.' },
      });
      return;
    }

    const { id } = req.params; // discussionId
    const { commentId } = req.body;

    if (!commentId) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'commentId is required.' },
      });
      return;
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Discussion not found.' },
      });
      return;
    }

    // Only the question author can accept an answer
    const currentUserId = req.user._id?.toString();
    if (String(discussion.authorId) !== currentUserId) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only the question author can accept an answer.' },
      });
      return;
    }

    // Prevent accepting multiple answers or re-accepting
    if (discussion.acceptedAnswerId) {
      res.status(400).json({
        success: false,
        error: { code: 'ALREADY_RESOLVED', message: 'An answer has already been accepted for this question.' },
      });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Comment not found.' },
      });
      return;
    }

    // Prevent accepting comments from a different discussion
    if (String(comment.discussionId) !== String(discussion._id)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_COMMENT', message: 'Comment does not belong to this discussion.' },
      });
      return;
    }

    // Prevent self-accepting answers to farm reputation points
    if (String(comment.authorId) === currentUserId) {
      res.status(400).json({
        success: false,
        error: { code: 'SELF_ACCEPT_PREVENTED', message: 'You cannot accept your own answer to award reputation points.' },
      });
      return;
    }

    comment.isAcceptedAnswer = true;
    await comment.save();

    discussion.status = 'resolved';
    discussion.acceptedAnswerId = comment._id as any;
    await discussion.save();

    // Reward helpful peer/mentor with reputation points (+15 points)
    await User.findByIdAndUpdate(comment.authorId, { $inc: { reputationPoints: 15 } });

    // Send in-app notification to peer
    try {
      await Notification.create({
        userId: comment.authorId,
        type: 'answer_accepted',
        title: 'Answer Marked as Accepted!',
        message: `Your explanation on "${discussion.title}" was marked as accepted (+15 Reputation Points).`,
        payloadJson: { discussionId: discussion._id, commentId: comment._id },
      });
    } catch {
      // Safe fallback if notifications collection is unavailable
    }

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
