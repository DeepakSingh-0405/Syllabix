import mongoose, { Document, Schema } from 'mongoose';

// 1. Institution
export interface IInstitution extends Document {
  name: string;
  domain: string;
  state: string;
  verified: boolean;
}

export const Institution = mongoose.model<IInstitution>(
  'Institution',
  new Schema({
    name: { type: String, required: true, trim: true, index: true },
    domain: { type: String, required: true, unique: true },
    state: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  }, { timestamps: true })
);

// 2. Program (e.g. B.Tech, M.Tech, BCA, MCA)
export interface IProgram extends Document {
  institutionId: mongoose.Types.ObjectId;
  name: string;
  code: string;
  durationYears: number;
}

export const Program = mongoose.model<IProgram>(
  'Program',
  new Schema({
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    durationYears: { type: Number, default: 4 },
  }, { timestamps: true })
);

// 3. Branch (e.g. Computer Science, Electrical Engineering)
export interface IBranch extends Document {
  programId: mongoose.Types.ObjectId;
  name: string;
  code: string;
}

export const Branch = mongoose.model<IBranch>(
  'Branch',
  new Schema({
    programId: { type: Schema.Types.ObjectId, ref: 'Program', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
  }, { timestamps: true })
);

// 4. Subject (e.g. Data Structures & Algorithms, Operating Systems)
export interface ISubject extends Document {
  branchId: mongoose.Types.ObjectId;
  semester: number;
  code: string;
  name: string;
  description: string;
  credits: number;
  isCore: boolean;
  topicCount: number;
}

export const Subject = mongoose.model<ISubject>(
  'Subject',
  new Schema({
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: false, index: true },
    semester: { type: Number, required: true, min: 1, max: 12, index: true },
    code: { type: String, required: true, uppercase: true, trim: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    credits: { type: Number, default: 4 },
    isCore: { type: Boolean, default: true },
    topicCount: { type: Number, default: 0 },
  }, { timestamps: true })
);

// 5. Unit (Syllabus Module / Unit)
export interface IUnit extends Document {
  subjectId: mongoose.Types.ObjectId;
  number: number;
  title: string;
}

export const Unit = mongoose.model<IUnit>(
  'Unit',
  new Schema({
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    number: { type: Number, required: true },
    title: { type: String, required: true },
  }, { timestamps: true })
);

// 6. Topic
export interface ITopic extends Document {
  unitId: mongoose.Types.ObjectId;
  title: string;
  prerequisiteTopicIds: mongoose.Types.ObjectId[];
}

export const Topic = mongoose.model<ITopic>(
  'Topic',
  new Schema({
    unitId: { type: Schema.Types.ObjectId, ref: 'Unit', required: true },
    title: { type: String, required: true },
    prerequisiteTopicIds: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
  }, { timestamps: true })
);
