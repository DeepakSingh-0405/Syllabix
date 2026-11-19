# Syllabix REST API Reference Specification

Base URL: `http://localhost:5001/api/v1`

All responses follow a consistent JSON format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```
Errors return:
```json
{
  "success": false,
  "error": "Error description message"
}
```

---

## 1. System Health
### `GET /health`
- **Description:** Verifies service liveness and database/dependency readiness.
- **Auth Required:** No.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "timestamp": "2026-11-19T18:00:00.000Z",
    "mongoConnected": true,
    "supabaseConnected": false
  }
  ```

---

## 2. Subjects & Curriculum
### `GET /subjects`
- **Description:** Retrieves academic subjects with optional filtering.
- **Query Parameters:**
  - `semester` (number, optional)
  - `branch` (string, optional)
  - `search` (string, optional)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "673cf9704e9e4a30e8c8b410",
        "code": "CS-201",
        "name": "Data Structures & Algorithms",
        "semester": 3,
        "credits": 4,
        "isCore": true,
        "units": [ ... ]
      }
    ]
  }
  ```

### `GET /subjects/:id`
- **Description:** Retrieves detailed subject data including units, topics, and prescribed textbooks.

---

## 3. AI Study Assistant & Tools
### `POST /ai/chat`
- **Description:** Submits a conversational query grounded in subject curriculum.
- **Request Body:**
  ```json
  {
    "prompt": "What are the four Coffman conditions for deadlock?",
    "subjectCode": "CS-302",
    "conversationHistory": [ ... ]
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "response": "The four Coffman conditions are...",
      "citations": [
        { "source": "Unit 3: Process Synchronization", "reference": "Operating Systems Concepts" }
      ],
      "rateLimit": { "remaining": 95, "total": 100 }
    }
  }
  ```

### `GET /ai/summary`
- **Description:** Generates structured revision notes for a subject.
- **Query Parameters:** `subjectId` (string, required).

### `GET /ai/quiz`
- **Description:** Generates a 5-question multi-choice mock assessment.
- **Query Parameters:** `subjectId` (string, required), `difficulty` (`easy` | `medium` | `hard`).

### `GET /ai/flashcards`
- **Description:** Fetches or generates SM-2 spaced repetition cards.

---

## 4. Academic Resources
### `POST /resources/upload-url`
- **Description:** Generates a signed PUT URL for direct-to-storage file uploads.
- **Auth Required:** Yes (`Bearer <token>`).

### `POST /resources/confirm-upload`
- **Description:** Confirms file upload, triggers text parsing, and saves database record.
- **Auth Required:** Yes.

### `GET /resources`
- **Description:** Lists academic resources filtered by subject, semester, or document type.

---

## 5. Discussions & Community
### `GET /discussions`
- **Description:** Lists community discussion threads.
- **Query Parameters:** `subjectId`, `page`, `limit`.

### `POST /discussions`
- **Description:** Creates a new discussion inquiry.
- **Auth Required:** Yes.

### `GET /discussions/:id/comments`
- **Description:** Lists replies and peer answers for a specific discussion.

---

## 6. Study Groups & Mentorship
### `GET /study-groups`
- **Description:** Lists active collaborative study groups.

### `GET /mentors`
- **Description:** Lists verified academic mentors with subject expertise.

---

## 7. Gamification & Analytics
### `GET /gamification/leaderboard`
- **Description:** Returns top ranked students based on academic contribution points.

### `GET /analytics/overview`
- **Description:** Returns institutional resource coverage, active students, and verified syllabus metrics.
