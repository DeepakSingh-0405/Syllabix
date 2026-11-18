import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'answer_accepted'
  | 'mentorship_request'
  | 'mentorship_accepted'
  | 'resource_verified'
  | 'reputation_bonus';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  payloadJson?: any;
  isRead: boolean;
  createdAt: Date;
}

export const Notification = mongoose.model<INotification>(
  'Notification',
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      type: {
        type: String,
        enum: ['answer_accepted', 'mentorship_request', 'mentorship_accepted', 'resource_verified', 'reputation_bonus'],
        required: true,
      },
      title: { type: String, required: true },
      message: { type: String, required: true },
      payloadJson: { type: Schema.Types.Mixed },
      isRead: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);
