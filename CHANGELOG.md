# Changelog

All notable changes to the Syllabix platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Security
- Sanitized production error responses in `server/src/middleware/errorHandler.ts`, `server/src/utils/sanitize.ts`, and `server/src/controllers/aiController.ts`: ensured production 500 error envelopes suppress stack traces, filesystem internals, and sensitive database error messages while preserving full diagnostic error logs on the server and detailed stack traces for local development.
- Sanitized search regular expressions in `server/src/utils/sanitize.ts`, `server/src/controllers/academicController.ts`, `server/src/controllers/resourceController.ts`, and `server/src/controllers/aiController.ts`: safely escaped regex metacharacters in search queries and subject lookup filters to protect against ReDoS and query injection vulnerabilities.
- Prevented reputation manipulation in `server/src/controllers/discussionController.ts` and `server/src/routes/index.ts`: bound `verifySupabaseToken` and payload validation to answer acceptance, verified question author ownership, blocked multiple/duplicate answer acceptances, prevented self-acceptance reputation farming, and dispatched in-app peer notifications.
- Enforced flashcard review ownership in `server/src/controllers/aiController.ts` and `server/src/routes/index.ts`: bound `verifySupabaseToken` to review submission endpoint, validated that reviewing user owns the associated flashcard deck or is an administrator, and rejected unauthorized attempts with 403 Forbidden.
- Enforced document access permissions in `server/src/controllers/resourceController.ts` and `server/src/routes/index.ts`: added `isPrivate` attribute to Resource schema, allowed public downloads without auth while strictly requiring ownership or admin privileges for private downloads, and required authentication and ownership verification for upload confirmations.
- Protected mentorship conversations in `server/src/controllers/mentorshipController.ts` and `server/src/routes/index.ts`: enforced strict student/mentor participant validation on message reads and writes, returning 401/403 for unauthorized access.
- Restricted demo authentication in `server/src/middleware/auth.ts`: enforced strict production rejection regardless of environment overrides and eliminated arbitrary prefix bypasses with exact token whitelisting.

### Fixed
- Ensured idempotent database seed in `server/src/config/seed.ts`, `server/src/controllers/academicController.ts`, `server/src/controllers/studyGroupController.ts`, and `server/src/controllers/mentorshipController.ts`: consolidated all initial seed operations into unique-key query and upsert logic to prevent duplicate insertions across concurrent requests and server restarts while preserving strict relational integrity.
- Normalized leaderboard ranking in `server/src/controllers/analyticsController.ts`: implemented `assignLeaderboardRanks` for deterministic sorting with secondary tie-breakers, 1-based standard competition ranks, and accurate tier/badge assignments (`Curriculum Pioneer`, `Senior Mentor`, `Doubt Solver`, `Novice Scholar`).
- Computed accurate coverage metrics in `server/src/controllers/analyticsController.ts`: implemented `calculateCoverageMetrics` with weighted resource breadth and unit/topic depth, safely handled missing units and zero-topic conditions, eliminated arbitrary baseline scores, and determined descriptive status badges (`Comprehensive`, `Adequate`, `Needs Question Papers`, `Needs Lecture Notes`, `Uncovered`).
- Aligned verified resource query in `server/src/controllers/analyticsController.ts`: replaced non-existent `verificationStatus` query with unified `verifiedResourceFilter` matching primary schema `isVerified: true` as well as legacy migration fallbacks (`status: 'verified'`, `verificationStatus: 'verified'`), and accurately reported `verifiedResources` in institutional overview.
- Validated storage direct PUT in `client/src/components/UploadModal.tsx`: enforced strict HTTP/HTTPS protocol validation on pre-signed upload URLs, added 30-second `AbortController` timeout for direct storage PUT requests, handled network and CORS failures gracefully, and strictly gated `confirm-upload` on verified storage upload success.
- Improved upload flow reliability in `client/src/components/UploadModal.tsx`: added client-side validation for file size (25 MB max) and formats (PDF, DOCX, PPTX, TXT), progressive upload percentage tracker, non-hanging error handling, and inline retry action.
- Repaired demo and Supabase session handling in `client/src/lib/api.ts` with local session expiration verification and eliminated anonymous user impersonation on write operations.
- Normalized API response contracts in `server/src/controllers/analyticsController.ts` and `client/src/lib/api.ts` to consistently wrap and unwrap `{ success: true, data: ... }`, ensuring leaderboard and institutional analytics render properly.
- Fixed PDF document parsing in `server/src/services/documentParser.ts` by updating to `pdf-parse` v2 constructor and API, enabling multi-page extraction and graceful error handling.

### Added
- Added peer presence indicators in `client/src/hooks/useRealtime.ts` and `client/src/pages/StudyRoomsPage.tsx`: enabled real-time presence tracking on `sync`, `join`, and `leave` events with an interactive active scholar roster popover, inline join/leave notices in chat feed, and live room pulse indicators.
- Implemented Supabase Realtime study room chat in `client/src/hooks/useRealtime.ts` and `client/src/pages/StudyRoomsPage.tsx`: enabled real-time broadcasting and receiving of study room messages with optimistic local dispatch, robust deduplication, connection state indicators (`connecting`, `connected`, `disconnected`), and proper channel cleanup on room switch and unmount.
- Added discussion resolution status indicators in `client/src/pages/DiscussionsPage.tsx`: introduced status filter tabs (`All`, `Resolved`, `Open`), clear resolved and open doubt badges on discussion cards, verified academic solution highlight banner, and emphasized accepted answer cards using design tokens.
- Added "Accept Answer" action for discussion authors in `client/src/pages/DiscussionsPage.tsx`: enabled question owners to accept peer answers via `PATCH /api/v1/discussions/:id/accept-answer`, updating UI state immediately, prioritizing verified solutions, awarding +15 reputation points to contributors, and rendering error dismissals.
- Implemented discussion comment loading in `server/src/controllers/discussionController.ts`, `server/src/routes/index.ts`, and `client/src/pages/DiscussionsPage.tsx`: added `GET /discussions/:id/comments` endpoint sorting accepted solutions first, with responsive loading skeletons, comment count synchronization, and author reputation display.
- Comprehensive project documentation suite (`README.md`, `MEMORY.md`, `CONTRIBUTING.md`, `SECURITY.md`, and technical specifications in `docs/`).
- GitHub CI actions workflow (`.github/workflows/ci.yml`) and issue/PR templates.
- Root `.env.example` template covering backend and client configurations.

### Changed
- Resolved backend default port collision by migrating default to `5001`.
- Integrated Lenis inertial smooth scrolling with `allowNestedScroll: true` and modal backdrop lock.
- Refreshed design system to Indigo Dark Theme tokens.
