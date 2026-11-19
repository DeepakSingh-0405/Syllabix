# Changelog

All notable changes to the Syllabix platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]
### Security
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
