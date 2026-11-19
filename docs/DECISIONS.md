# Architecture Decision Records (ADRs)

---

## ADR-001: Resolve Express Default Port Collision to Port 5001
- **Status:** Accepted & Implemented
- **Date:** 2026-11-19
- **Context:** macOS Monterey and newer versions bind port 5000 to the AirPlay Receiver service (`ControlCe`). When starting local development, Express threw `EADDRINUSE` errors on port 5000.
- **Decision:** Change the default backend port to `5001` across `server/src/config/env.ts`, `server/src/index.ts`, and client API configurations, while preserving explicit `process.env.PORT` overrides.
- **Consequences:** Eliminates startup crashes on developer Mac machines without impacting production deployments that supply explicit port variables.

---

## ADR-002: Inertial Smooth Scrolling with Lenis and Backdrop Scroll Lock
- **Status:** Accepted & Implemented
- **Date:** 2026-11-19
- **Context:** Standard browser scrolling felt disconnected from dynamic 3D background motion, and nested modal/drawer scrolling caused parent page jumping.
- **Decision:** Integrate Lenis smooth scrolling with `allowNestedScroll: true`, `data-lenis-prevent` on dialogs, and a zero-layout-shift `useBodyScrollLock` custom hook.
- **Consequences:** Smooth fluid scrolling with reduced-motion fallbacks and zero layout shift when drawers open.

---

## ADR-003: Deterministic Offline AI Fallback Engine
- **Status:** Accepted & Implemented
- **Date:** 2026-11-19
- **Context:** External AI APIs (Gemini) can encounter rate limits, network outages, or key misconfigurations during student study sessions.
- **Decision:** Implement an in-memory deterministic context synthesis engine in `aiService.ts` that synthesizes official course syllabus units when live API calls fail.
- **Consequences:** The application never displays blank or broken pages to students during exam preparation.
