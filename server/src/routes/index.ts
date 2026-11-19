import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { verifySupabaseToken, optionalSupabaseToken } from '../middleware/auth';
import * as authController from '../controllers/authController';
import * as academicController from '../controllers/academicController';
import * as resourceController from '../controllers/resourceController';
import * as aiController from '../controllers/aiController';
import * as discussionController from '../controllers/discussionController';
import * as studyGroupController from '../controllers/studyGroupController';
import * as mentorshipController from '../controllers/mentorshipController';
import * as notificationController from '../controllers/notificationController';
import * as analyticsController from '../controllers/analyticsController';
import { isDatabaseConnected, getConnectionState } from '../config/database';
import { env, isSupabaseConfigured, isGeminiConfigured } from '../config/env';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  const dbConnected = isDatabaseConnected();
  const dbState = getConnectionState();
  const supabaseOk = isSupabaseConfigured;
  const geminiOk = isGeminiConfigured;

  // Status is healthy when all primary services are online; degraded when running on resilient fallbacks
  const status: 'healthy' | 'degraded' = dbConnected && supabaseOk ? 'healthy' : 'degraded';

  res.json({
    status,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'Syllabix MERN Backend API',
    environment: env.NODE_ENV,
    checks: {
      database: {
        status: dbState,
        connected: dbConnected,
      },
      supabase: {
        configured: supabaseOk,
        status: supabaseOk ? 'connected' : 'mock_mode',
      },
      gemini: {
        configured: geminiOk,
        status: geminiOk ? 'live_api' : 'deterministic_synthesis',
      },
    },
    // Backward compatibility for legacy monitoring
    supabaseConnected: supabaseOk,
  });
});

// Auth & Users
router.get('/users/me', verifySupabaseToken, authController.getMe);
router.patch('/users/profile', verifySupabaseToken, authController.updateProfile);

// Academic Hierarchy & Syllabus
router.get('/institutions', academicController.getInstitutions);
router.get('/subjects', academicController.getSubjects);
router.get('/subjects/:id', academicController.getSubjectById);

// Resources & Supabase Storage
router.get('/resources', resourceController.getResources);
router.post(
  '/resources/upload-intent',
  optionalSupabaseToken,
  validate(
    z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      resourceType: z.enum(['syllabus', 'lecture_notes', 'question_paper', 'lab_manual', 'reference_book']).optional(),
      subjectId: z.string().optional(),
      subjectName: z.string().optional(),
      subjectCode: z.string().optional(),
      semester: z.union([z.string(), z.number()]).optional(),
      fileName: z.string().optional(),
      mimeType: z.string().optional(),
      fileSizeBytes: z.number().optional(),
      isPrivate: z.boolean().optional(),
    })
  ),
  resourceController.requestUploadIntent
);
router.post('/resources/:id/confirm-upload', verifySupabaseToken, resourceController.confirmUpload);
router.get('/resources/:id/download-url', optionalSupabaseToken, resourceController.getDownloadUrl);

// AI & Study Assistant (Gemini)
router.post(
  '/ai/study-assistant/query',
  optionalSupabaseToken,
  validate(
    z.object({
      prompt: z.string().optional(),
      query: z.string().optional(),
      subjectId: z.string().optional(),
      resourceId: z.string().optional(),
      resourceIds: z.array(z.string()).optional(),
      scannedDocumentText: z.string().optional(),
      documentName: z.string().optional(),
      history: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string(),
          })
        )
        .optional(),
    }).refine((data) => Boolean(data.prompt?.trim() || data.query?.trim()), {
      message: 'Either prompt or query is required',
    })
  ),
  aiController.queryStudyAssistant
);
router.post(
  '/ai/summarize',
  optionalSupabaseToken,
  validate(
    z.object({
      subjectId: z.string().optional(),
      resourceId: z.string().optional(),
      format: z.string().optional(),
    }).refine((data) => Boolean(data.subjectId || data.resourceId), {
      message: 'Either subjectId or resourceId is required',
    })
  ),
  aiController.generateSummary
);
router.post(
  '/ai/quiz',
  optionalSupabaseToken,
  validate(
    z.object({
      subjectId: z.string().optional(),
      resourceId: z.string().optional(),
      difficulty: z.string().optional(),
      questionCount: z.coerce.number().optional(),
    }).refine((data) => Boolean(data.subjectId || data.resourceId), {
      message: 'Either subjectId or resourceId is required',
    })
  ),
  aiController.generateQuiz
);
router.get('/ai/flashcards/:subjectId', optionalSupabaseToken, aiController.getOrCreateFlashcardDeck);
router.post(
  '/ai/flashcards/:cardId/review',
  verifySupabaseToken,
  validate(
    z.object({
      quality: z.number().min(0).max(5),
    })
  ),
  aiController.reviewFlashcard
);

// Community Discussions & Realtime Q&A
router.get('/discussions', discussionController.getDiscussions);
router.post(
  '/discussions',
  optionalSupabaseToken,
  validate(
    z.object({
      subjectId: z.string(),
      title: z.string().min(5),
      body: z.string().min(10),
      tags: z.array(z.string()).optional(),
    })
  ),
  discussionController.createDiscussion
);
router.get('/discussions/:id/comments', discussionController.getComments);
router.post(
  '/discussions/:id/comments',
  optionalSupabaseToken,
  validate(
    z.object({
      body: z.string().min(2),
    })
  ),
  discussionController.addComment
);
router.patch(
  '/discussions/:id/accept-answer',
  verifySupabaseToken,
  validate(
    z.object({
      commentId: z.string().min(1),
    })
  ),
  discussionController.acceptAnswer
);

// Collaborative Study Groups & Realtime Circles
router.get('/study-groups', studyGroupController.getStudyGroups);
router.post(
  '/study-groups',
  optionalSupabaseToken,
  validate(
    z.object({
      name: z.string().min(3),
      subjectId: z.string(),
      schedule: z.string().optional(),
      activeTopic: z.string().optional(),
    })
  ),
  studyGroupController.createStudyGroup
);
router.post('/study-groups/:id/join', optionalSupabaseToken, studyGroupController.joinStudyGroup);
router.get('/study-groups/:id/messages', studyGroupController.getRoomMessages);
router.post('/study-groups/:id/messages', optionalSupabaseToken, studyGroupController.postRoomMessage);

// Senior-Junior Mentorship
router.get('/mentors', mentorshipController.getMentors);
router.post(
  '/mentors/request',
  verifySupabaseToken,
  validate(
    z.object({
      mentorUserId: z.string(),
      subjectId: z.string(),
      message: z.string().min(5),
      scheduledAt: z.string().optional(),
    })
  ),
  mentorshipController.requestMentorship
);
router.get('/mentors/my-requests', verifySupabaseToken, mentorshipController.getMyRequests);
router.patch('/mentors/requests/:id', verifySupabaseToken, mentorshipController.updateRequestStatus);
router.get('/mentors/requests/:id/messages', verifySupabaseToken, mentorshipController.getMentorshipMessages);
router.post('/mentors/requests/:id/messages', verifySupabaseToken, mentorshipController.postMentorshipMessage);

// Realtime User Notifications
router.get('/notifications', verifySupabaseToken, notificationController.getNotifications);
router.patch('/notifications/:id/read', verifySupabaseToken, notificationController.markNotificationRead);

// Scale, Gamification & Institutional Analytics (Phase 4)
router.get('/gamification/leaderboard', analyticsController.getLeaderboard);
router.get('/analytics/coverage/:subjectId', analyticsController.getSyllabusCoverage);
router.get('/analytics/overview', analyticsController.getInstitutionalOverview);

export default router;
