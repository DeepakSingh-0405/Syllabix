# Syllabix Testing & Verification Strategy

## 1. Multi-Tier Testing Pyramid
Syllabix employs a 4-tier automated test harness executed via `npm test` (`tests/e2e-ai-verification.ts`):

1. **Tier 1 — Core Functional Feature Coverage (40 Test Cases):**
   - Grounded chatbot inquiries across multiple curriculum subjects.
   - Summarization engine resolution by subject and resource ID.
   - Flashcards SM-2 spaced repetition math (progression, lapse, reset).
   - Quiz generation with distractor uniqueness and difficulty tiers.
   - UI component contracts (DetailsDrawer, FlashcardDeckModal, AssistantPage).
   - Design system token purity and accessibility focus clearance.
2. **Tier 2 — Boundary & Corner Cases (20 Test Cases):**
   - Missing query parameters (HTTP 400 Bad Request).
   - Large prompt inputs (> 5,000 characters) and ReDoS resistance.
   - Subject code fallbacks and malformed IDs.
   - SM-2 recall rating boundary clamping (< 0 and > 5).
3. **Tier 3 — Cross-Feature Workflows (5 Test Cases):**
   - Tri-feature curriculum journey (Summary -> Flashcards -> Quiz).
   - Scanned document cross-channel citations.
   - Flashcard lapse to chatbot remediation.
4. **Tier 4 — Real-World Student Journeys (5 Test Cases):**
   - 48-hour pre-exam sprint.
   - Lecture note scan query.
   - Full spaced repetition study deck lifecycle.

---

## 2. Test Execution Commands

```bash
# Run the complete 70-case verification test suite
npm test

# Run backend TypeScript compiler check
npm run build:server

# Run frontend TypeScript & Vite compiler check
npm run build:client
```

---

## 3. Writing Focused Task Tests
When implementing bug fixes or features (e.g. PDF parsing, API response normalization, authorization):
- Add unit/integration tests directly into the appropriate test files or subdirectories.
- Execute the specific test suite.
- Verify 0 regressions before committing.
