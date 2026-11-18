import mongoose, { Document, Schema } from 'mongoose';

export interface IDiscussion extends Document {
  subjectId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  tags: string[];
  status: 'open' | 'resolved' | 'closed';
  upvotes: number;
  commentCount: number;
  acceptedAnswerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const Discussion = mongoose.model<IDiscussion>(
  'Discussion',
  new Schema({
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
    upvotes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    acceptedAnswerId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  }, { timestamps: true })
);

export interface IComment extends Document {
  discussionId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  isAcceptedAnswer: boolean;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export const Comment = mongoose.model<IComment>(
  'Comment',
  new Schema({
    discussionId: { type: Schema.Types.ObjectId, ref: 'Discussion', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    isAcceptedAnswer: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
  }, { timestamps: true })
);
