# Syllabix System Architecture Specification

## 1. Architectural Philosophy
Syllabix is architected as a decoupled, multi-tiered academic knowledge system with an emphasis on low-latency interactive student workflows and high-fidelity curriculum grounding.

```
+---------------------------------------------------------------+
|                      Client Presentation Tier                 |
|   React 18 SPA + Vite 6 + React Router v7 + Tailwind CSS      |
+-------------------------------+-------------------------------+
                                | HTTPS / JSON REST API
                                v
+---------------------------------------------------------------+
|                      Application Services Tier                |
|      Express 4 (TypeScript) + Helmet + Zod Validation         |
|  - Ingestion Engine    - Context Synthesizer  - SM-2 Scheduler|
+---------------+-------------------------------+---------------+
                |                               |
                v                               v
+-------------------------------+ +-----------------------------+
|        Data Persistence       | |    External Cloud Services  |
| - MongoDB (Curriculum, Notes) | | - Supabase Auth & Storage   |
| - Mongoose 8 Document Store   | | - Google Gemini Generative  |
+-------------------------------+ +-----------------------------+
```

## 2. Frontend Architecture
- **Single Page Application (SPA):** Built with React 18 and Vite 6.
- **Routing Strategy:** React Router DOM v7 providing client-side route transitions (`/`, `/assistant`, `/discussions`, `/study-rooms`, `/mentorship`, `/leaderboard`, `/analytics`).
- **State Management:** Context API (`AuthContext`) for global user identity and local React hooks for scoped UI and data states.
- **Motion & Accessibility:** Framer Motion for card reveals, GSAP for landing hero stagger, and Lenis for smooth inertial scrolling with `prefers-reduced-motion` compliance.

## 3. Backend Architecture
- **API Gateway & Router:** Express 4 written in TypeScript, mounted under `/api/v1`.
- **Middleware Pipeline:**
  1. `helmet()`: Security header injection.
  2. `cors()`: Cross-Origin Resource Sharing whitelist (`CLIENT_URL`).
  3. `morgan('dev')`: Structured HTTP request logging.
  4. `express.json()` & `express.urlencoded()`: Body parsing.
  5. `authenticate`: Optional/mandatory Supabase JWT token verification and user extraction.
- **Controller & Service Layer:** Clean separation between HTTP transport logic (controllers) and domain logic (services: `aiService.ts`, `documentParser.ts`, `storageService.ts`).

## 4. External Integrations
- **Supabase Authentication:** Validates user identities via RS256/HS256 signed JWTs.
- **Supabase Storage:** Private academic document repository. Client initiates signed upload; server verifies and parses file binary for semantic chunking.
- **Google Gemini API:** Grounded question answering, contextual summarization, and mock quiz generation. Includes offline deterministic fallbacks for high-availability resilience.
