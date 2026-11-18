export type UserRole = 'student' | 'contributor' | 'mentor' | 'moderator' | 'admin';

export interface User {
  _id: string;
  supabaseUserId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  reputationPoints: number;
}

export interface Subject {
  _id: string;
  code: string;
  name: string;
  description: string;
  semester: number;
  credits: number;
  isCore: boolean;
  topicCount: number;
}

export type ResourceType = 'syllabus' | 'lecture_notes' | 'question_paper' | 'lab_manual' | 'reference_book';

export interface Resource {
  _id: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  subjectId: {
    _id: string;
    name: string;
    code: string;
    semester: number;
  };
  storagePath: string;
  mimeType: string;
  fileSizeBytes: number;
  status: 'uploading' | 'processing' | 'ready' | 'needs_review' | 'rejected';
  viewCount: number;
  downloadCount: number;
  isVerified: boolean;
  version: number;
  createdAt: string;
}

export interface AICitation {
  docId: string;
  title: string;
  pageNumber: number;
  section?: string;
  excerpt?: string;
}

export interface AIResponse {
  answer: string;
  citations: AICitation[];
  model: string;
}
