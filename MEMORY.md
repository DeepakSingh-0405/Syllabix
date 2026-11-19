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
- [ ] **Task 10:** Sanitize Server Error Responses (`server/src/server.ts` - suppress stack trace leaks in production)
- [ ] **Tasks 04–10:** Security & Authorization Hardening
- [ ] **Tasks 11–13:** Community Discussions & Answer Acceptance
- [ ] **Tasks 14–15:** Real-Time Study Room Chat & Presence
- [ ] **Tasks 16–17:** Document Upload & Ingestion Pipeline
- [ ] **Tasks 18–20:** Analytics Dashboard & Leaderboard Rankings
- [ ] **Tasks 21–24:** Database & Backend Reliability
- [ ] **Tasks 25–29:** AI Study Assistant Optimization
- [ ] **Tasks 30–33:** Auth Context & Frontend Fallback Stabilization
- [ ] **Tasks 34–36:** Flashcards SM-2 & Subject Directory
- [ ] **Tasks 37–38:** E2E Verification & Release Audit

---

## G. Known Issues & Tech Debt
1. `server/src/services/documentParser.ts`: Incompatible `pdf-parse` v2 module syntax causing potential parser errors on binary PDF buffers.
2. `server/src/controllers/gamificationController.ts` & `analyticsController.ts`: Returns data payloads without uniform `{ success: true, data: ... }` envelope, breaking client hooks expecting uniform contracts.
3. Client `api.ts` only reads Supabase auth token, omitting demo tokens stored in localStorage.
4. Search endpoints in `aiController.ts` and `resourceController.ts` execute unsanitized string inputs in RegExp constructors.

---

## H. Next Action
- **Current Task:** Completed Task 09: Sanitize Search Expressions.
- **Immediate Next Task:** Task 10: Sanitize Server Error Responses (`server/src/server.ts` - suppress stack trace leaks in production).
