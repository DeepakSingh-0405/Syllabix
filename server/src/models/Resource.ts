import mongoose, { Document, Schema } from 'mongoose';

export type ResourceType = 'syllabus' | 'lecture_notes' | 'question_paper' | 'lab_manual' | 'reference_book';
export type ResourceStatus = 'uploading' | 'processing' | 'ready' | 'needs_review' | 'rejected';

export interface IResource extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  resourceType: ResourceType;
  subjectId: mongoose.Types.ObjectId;
  topicIds: mongoose.Types.ObjectId[];
  storagePath: string; // Supabase Storage Object Path
  mimeType: string;
  fileSizeBytes: number;
  status: ResourceStatus;
  viewCount: number;
  downloadCount: number;
  isVerified: boolean;
  version: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    resourceType: {
      type: String,
      enum: ['syllabus', 'lecture_notes', 'question_paper', 'lab_manual', 'reference_book'],
      default: 'syllabus',
      index: true,
    },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    topicIds: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    storagePath: { type: String, required: true },
    mimeType: { type: String, default: 'application/pdf' },
    fileSizeBytes: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['uploading', 'processing', 'ready', 'needs_review', 'rejected'],
      default: 'uploading',
      index: true,
    },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
