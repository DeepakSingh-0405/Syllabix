import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { User } from '../models/User';

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }
    res.json({
      success: true,
      data: req.user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { name, institutionId, branchId, semester } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(institutionId && { institutionId }),
        ...(branchId && { branchId }),
        ...(semester && { semester }),
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { message: err.message } });
  }
};
