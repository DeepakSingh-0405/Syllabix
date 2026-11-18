import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'student' | 'contributor' | 'mentor' | 'moderator' | 'admin';

export interface IUser extends Document {
  supabaseUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  institutionId?: mongoose.Types.ObjectId;
  branchId?: mongoose.Types.ObjectId;
  semester?: number;
  reputationPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    supabaseUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'contributor', 'mentor', 'moderator', 'admin'],
      default: 'student',
    },
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
    },
    branchId: {
      type: Schema.Types.ObjectId,
      ref: 'Branch',
    },
    semester: {
      type: Number,
      min: 1,
      max: 12,
    },
    reputationPoints: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
