import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyGroupMessage {
  _id?: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  createdAt: Date;
}

export interface IStudyGroup extends Document {
  name: string;
  subjectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  visibility: 'public' | 'private';
  schedule: string;
  activeTopic: string;
  memberIds: mongoose.Types.ObjectId[];
  messages: IStudyGroupMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const StudyGroupSchema = new Schema<IStudyGroup>(
  {
    name: { type: String, required: true, trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
    schedule: { type: String, default: 'Daily 6:00 PM - 8:00 PM IST' },
    activeTopic: { type: String, default: 'Core Curriculum & Exam Problem Solving' },
    memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    messages: [
      {
        senderId: { type: String, required: true },
        senderName: { type: String, required: true },
        senderRole: { type: String, default: 'student' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const StudyGroup = mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema);
