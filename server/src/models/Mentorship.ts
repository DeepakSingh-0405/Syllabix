import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  expertiseSubjectIds: mongoose.Types.ObjectId[];
  bio: string;
  availability: string;
  rating: number;
  sessionsCompleted: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const MentorProfile = mongoose.model<IMentorProfile>(
  'MentorProfile',
  new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
      expertiseSubjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
      bio: { type: String, default: '' },
      availability: { type: String, default: 'Weekdays 5:00 PM - 7:00 PM IST' },
      rating: { type: Number, default: 4.9 },
      sessionsCompleted: { type: Number, default: 12 },
      verified: { type: Boolean, default: true },
    },
    { timestamps: true }
  )
);

export interface IMentorshipChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

export interface IMentorshipRequest extends Document {
  mentorId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  scheduledAt?: Date;
  messages: IMentorshipChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export const MentorshipRequest = mongoose.model<IMentorshipRequest>(
  'MentorshipRequest',
  new Schema(
    {
      mentorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
      message: { type: String, required: true },
      status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
      scheduledAt: { type: Date },
      messages: [
        {
          senderId: { type: String, required: true },
          senderName: { type: String, required: true },
          text: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
    { timestamps: true }
  )
);
