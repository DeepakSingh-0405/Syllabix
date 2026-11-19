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
- Repaired demo and Supabase session handling in `client/src/lib/api.ts` with local session expiration verification and eliminated anonymous user impersonation on write operations.
- Normalized API response contracts in `server/src/controllers/analyticsController.ts` and `client/src/lib/api.ts` to consistently wrap and unwrap `{ success: true, data: ... }`, ensuring leaderboard and institutional analytics render properly.
- Fixed PDF document parsing in `server/src/services/documentParser.ts` by updating to `pdf-parse` v2 constructor and API, enabling multi-page extraction and graceful error handling.

### Added
- Comprehensive project documentation suite (`README.md`, `MEMORY.md`, `CONTRIBUTING.md`, `SECURITY.md`, and technical specifications in `docs/`).
- GitHub CI actions workflow (`.github/workflows/ci.yml`) and issue/PR templates.
- Root `.env.example` template covering backend and client configurations.

### Changed
- Resolved backend default port collision by migrating default to `5001`.
- Integrated Lenis inertial smooth scrolling with `allowNestedScroll: true` and modal backdrop lock.
- Refreshed design system to Indigo Dark Theme tokens.
