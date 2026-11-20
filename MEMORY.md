# Syllabix — Persistent Engineering Memory (MEMORY.md)

This file maintains persistent architectural state, engineering decisions, and task execution progress across development cycles.

---

## A. Project Identity
- **Product Name:** Syllabix — AI-Powered Academic Knowledge & Collaboration Platform
- **Purpose:** University study and curriculum platform providing structured syllabus access, real-time collaboration, spaced repetition, student mentorship, and grounded AI study assistance.
- **Target Users:** Undergraduate and graduate university students, academic mentors, student contributors, and university administrators.
- **Current Status:** Phase 0 (Initial Safety & Documentation Milestone) in progress; moving to Task 01 (Core Bug Fixes).

---

## B. Technology Decisions
- **Frontend Stack:** React 18, Vite 6, TypeScript, Tailwind CSS, React Router v7, Framer Motion, GSAP, Lenis (smooth inertial scrolling), Lucide Icons.
- **Backend Stack:** Node.js 20+, Express 4, TypeScript, Zod, Helmet, CORS, Morgan.
- **Database:** MongoDB with Mongoose 8. Local instance: `mongodb://localhost:27017/syllabix_db`.
- **Authentication:** Supabase Authentication (JWT) with optional local development demo-session support.
- **File Storage:** Supabase Storage (private S3-compatible buckets with time-limited signed URLs).
- **AI Integrations:** Google Gemini API (`@google/genai` / `@google/generative-ai`), custom vector cosine-similarity embeddings, and fallback deterministic context synthesis.
- **Realtime Infrastructure:** Supabase Realtime (WebSockets channels with postgres_changes and broadcast presence).

---

## C. Architecture Knowledge
- **Directory Layout:**
  - `client/`: React 18 SPA (pages, components, hooks, design tokens, API client).
  - `server/`: Express TypeScript API (controllers, routes, services, models, middlewares).
  - `tests/`: End-to-end integration and verification suites (`tests/e2e-ai-verification.ts`).
  - `docs/`: Formal technical specifications, data flows, API reference, schemas.
- **Frontend Request Flow:** Single centralized API wrapper at [`client/src/lib/api.ts`](file:///Users/arpitrajput/Syllabix/client/src/lib/api.ts) dispatching to `VITE_API_BASE_URL` (`http://localhost:5001/api/v1`).
- **Backend Request Flow:** `server/src/server.ts` -> middleware (helmet, cors, express.json) -> `/api/v1` routes -> controllers -> Mongoose models & Gemini AI services.
- **Default Backend Port:** `5001` (specifically migrated to prevent conflicts with macOS AirPlay Receiver `ControlCe`).

---

## D. Development Rules
1. **Never Rebuild from Scratch:** Retain and build upon existing components, controllers, and design tokens.
2. **Sequential Task Execution:** Follow the strict 8-step lifecycle: Inspect -> Plan -> Implement -> Test -> Verify -> Commit -> Push -> Next Task.
3. **Purity of Design System:** Use established design tokens from [`client/src/tokens.css`](file:///Users/arpitrajput/Syllabix/client/src/tokens.css) (`#080b14`, `#0e1422`, `#17213a`, `#4f46e5`, `#6366f1`). No arbitrary unmapped hex values or off-scale typography.
4. **Zero Silent Failures:** Differentiate real errors from empty responses. Never present mocked or fake data when a backend request fails without notifying the user.
5. **No Secret Leaks:** Never commit `.env` files, API keys, or raw JWTs.

---

## E. Important Decisions
- **ADR-001 (Port 5001 Resolution):** Backend defaults to port `5001` (with `process.env.PORT` override) to prevent macOS port `5000` AirPlay collisions.
- **ADR-002 (Inertial Smooth Scrolling & Dialog Boundary):** Lenis integrated with `allowNestedScroll: true` and `data-lenis-prevent` on modals/drawers, accompanied by `useBodyScrollLock` to prevent scrollbar layout shifts.
- **ADR-003 (Deterministic Fallback Engine):** Gemini AI routes include offline curriculum synthesis so students can revise even during API outages or quota limits.
- **ADR-004 (Offline & Mock Auth Fallback):** When remote Supabase credentials are not configured or unreachable in development, AuthContext automatically bootstraps valid local sessions and binds `demo-bearer-token` / `demo-mentor-bearer-token` to requests, ensuring seamless sign-in, sign-up, and role switching without network timeouts.

---

## F. Current Progress
- [x] **Phase 0:** Initial Project Safety Check & Documentation Milestone (COMPLETED)
- [x] **Task 01:** Fix PDF Document Parsing (COMPLETED - integrated pdf-parse v2 PDFParse class)
- [x] **Task 02:** Normalize API Response Contract (COMPLETED - leaderboard & analytics responses standardized)
- [x] **Task 03:** Fix Demo Authentication Session Handling in `api.ts` (COMPLETED - demo session resolution & write guard)
- [x] **Task 04:** Fix Demo Token Security (COMPLETED - strict production restriction & exact token whitelist)
- [x] **Task 05:** Fix Mentorship Chat Authorization (COMPLETED - participant ownership & 401/403 validation)
- [x] **Task 06:** Fix Private Document Access (COMPLETED - private document ownership/admin enforcement & public download access)
- [x] **Task 07:** Fix Flashcard Permissions (COMPLETED - flashcard review ownership enforcement)
- [x] **Task 08:** Prevent Reputation Manipulation (COMPLETED - author validation, once-only acceptance, anti-reputation farming)
- [x] **Task 09:** Sanitize Search Expressions (COMPLETED - escape regex special characters across search and lookup endpoints)
- [x] **Task 10:** Sanitize Server Error Responses (COMPLETED - suppress stack trace and internal message leaks in production)
- [x] **Phase 2 (Tasks 04–10):** Security & Authorization Hardening (COMPLETED)
- [x] **Task 11:** Implement Discussion Answer Loading (COMPLETED - `GET /discussions/:id/comments` endpoint, comment fetching, loading skeletons, author reputation)
- [x] **Task 12:** Add Accept Answer UI Action (COMPLETED - author acceptance button, `PATCH /discussions/:id/accept-answer`, immediate UI update, +15 reputation award)
- [x] **Task 13:** Add Discussion Resolution Indicator (COMPLETED - status filter tabs, card badges, verified solution banner, highlighted accepted cards)
- [x] **Phase 3 (Tasks 11–13):** Complete Community Features (COMPLETED)
- [x] **Task 14:** Implement Supabase Realtime Chat (COMPLETED - real-time message broadcast, deduplication, connection state indicators, channel cleanup)
- [x] **Task 15:** Add Peer Presence Indicators (COMPLETED - presence sync/join/leave events, active scholar roster popover, inline join/leave notices)
- [x] **Phase 4 (Tasks 14–15):** Real-Time Study Rooms (COMPLETED)
- [x] **Task 16:** Improve Upload Flow Reliability (COMPLETED - file validation, progressive status, error recovery, retry capability)
- [x] **Task 17:** Validate Storage Direct PUT (COMPLETED - safe URL validation, timeout/CORS error handling, confirmation gating)
- [x] **Phase 5 (Tasks 16–17):** Document Upload & Ingestion Pipeline (COMPLETED)
- [x] **Task 18:** Align Verified Resource Query (COMPLETED - replaced non-existent verificationStatus with verifiedResourceFilter for isVerified and legacy fallbacks)
- [x] **Task 19:** Compute Accurate Coverage Metrics (COMPLETED - implemented calculateCoverageMetrics with zero-topic/missing-unit safety and descriptive status)
- [x] **Task 20:** Normalize Leaderboard Ranking (COMPLETED - deterministic tie-breaking, 1-based competition ranks, and badge/tier alignment)
- [x] **Phase 6 (Tasks 18–20):** Analytics Dashboard & Leaderboard Rankings (COMPLETED)
- [x] **Task 21:** Ensure Idempotent Database Seed (COMPLETED - unique-key check, centralized seedDatabase, zero duplicate insertions)
- [x] **Task 22:** Assign Study Group Owner Correctly (COMPLETED - bound ownerId to authenticated req.user._id and added to memberIds)
- [x] **Task 23:** Handle Mongo Disconnect Gracefully (COMPLETED - lifecycle listeners, reconnect scheduling, zero unhandled errors)
- [x] **Task 24:** Expand Health Check Status (COMPLETED - deep checks for MongoDB, Supabase, Gemini, uptime, degraded state)
- [x] **Phase 7 (Tasks 21–24):** Database & Backend Reliability (COMPLETED)
- [x] **Task 25:** Enforce Model Configuration (COMPLETED - canonical gemini-1.5-flash & text-embedding-004 models, zero non-existent model strings)
- [x] **Task 26:** Normalize Gemini API Error Handling (COMPLETED - GeminiApiError & parseGeminiError handling 429, 403, 503, timeouts with seamless fallback)
- [x] **Task 27:** Handle Empty Document Extraction Gracefully (COMPLETED - isEmpty flag, preserved short texts, descriptive ingestion fallback chunks)
- [x] **Task 28:** Ensure Deterministic AI Synthesis Fallback (COMPLETED - guaranteed complete, structured responses for Chatbot, Summary, Quiz, and Flashcards in offline/fallback mode with exact count guarantees across all subjects)
- [x] **Task 29:** Optimize Context Window & Chunk Selection (COMPLETED - fingerprint deduplication, multi-document source diversity balancing, per-chunk clamping to 1500 chars, and global context budget enforcement)
- [x] **Phase 8 (Tasks 25–29):** AI Study Assistant Optimization (COMPLETED)
- [x] **Task 30:** Initialize User Profile on First Login (COMPLETED - auto-bootstrapping on initial auth, explicit sync endpoint, populated academic relations, offline fallback)
- [x] **Task 31:** Handle Backend Unavailable in Client API (COMPLETED - ApiClientError, isBackendUnavailableError, HTML error page tolerance, 15s timeout, isomorphic env access)
- [x] **Phase 9 (Tasks 30–31):** User Onboarding & Resilience (COMPLETED)
- [x] **Task 32:** Provide Booking Confirmation Feedback (COMPLETED - rich confirmation card, live chat action, duplicate submission prevention, dismissible error banner)
- [x] **Task 33:** Add Notification Badge Counter (COMPLETED - reactive numerical badge with 9+ cap, dynamic aria-label, item mark-as-read, click-outside dismissal)
- [x] **Task 34:** Implement SM-2 Review Interval Scheduling (COMPLETED - pure calculateSM2Review, falsy 0 fix, EF >= 1.3 floor, exact progression math, due date scheduling)
- [x] **Task 35:** Add Semester and Branch Filters (COMPLETED - multi-dimensional branch/semester filtering, dynamic subject pill scoping, active filter badges, clear controls)
- [x] **Task 36:** Link Upload Modal from Subject Page (COMPLETED - pre-populating upload context from syllabus cards and details drawer, preserving A11Y single stretched link)
- [x] **Task 37:** Verify End-to-End User Workflows (COMPLETED - 7-journey end-to-end integration test suite, wired into root npm test)
- [x] **Task 38:** Prepare Production Release Audit (COMPLETED - version 1.0.0 release audit, documentation synchronization, full test coverage, zero build errors)
- [x] **Phase 10 (Tasks 32–36):** UI Polish & Workflow Completion (COMPLETED)
- [x] **Phase 11 (Tasks 37–38):** End-to-End Verification & Release Audit (COMPLETED)

---

## G. Known Issues & Tech Debt
**ZERO OPEN BLOCKERS / ZERO TECH DEBT**
- All 38 tasks across all 11 phases are 100% completed, tested, verified, and committed.
- Both `origin` (`rajputarpit0110/Syllabix`) and `upstream` (`DeepakSingh-0405/Syllabix`) are in exact synchronization on `main`.
- All GitHub Actions CI workflow runs pass 100% green.
- Both frontend and backend compile cleanly with zero TypeScript errors.

---

## H. Next Action
- **Platform Status:** All 38 tasks completed and verified for production release `v1.0.0`. Ready for university student deployment.
