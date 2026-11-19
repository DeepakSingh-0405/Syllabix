# Syllabix Data Flow Specifications

This document outlines the core data movement flows across the Syllabix system.

---

## 1. Authentication & Session Resolution Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant Client as React Client (AuthContext)
    participant Server as Express API (/api/v1)
    participant Supabase as Supabase Auth

    User->>Client: Sign in (Email/Google)
    Client->>Supabase: Authenticate credentials
    Supabase-->>Client: Return JWT Session
    Client->>Client: Store access_token in memory / storage
    User->>Client: Navigate to protected feature
    Client->>Server: Request with Authorization: Bearer <token>
    Server->>Server: Verify JWT signature & claims
    Server-->>Client: Authorized response
```

---

## 2. Document Upload & Ingestion Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant Modal as UploadModal.tsx
    participant API as /api/v1/resources
    participant S3 as Supabase Storage
    participant DP as documentParser.ts
    participant DB as MongoDB

    User->>Modal: Select PDF / notes file
    Modal->>API: POST /resources/upload-url { fileName, fileType, subjectId }
    API->>S3: Create signed upload URL
    S3-->>API: Signed PUT URL
    API-->>Modal: Return signed URL and storage path
    Modal->>S3: PUT binary file
    S3-->>Modal: 200 OK
    Modal->>API: POST /resources/confirm-upload { storagePath, resourceId }
    API->>S3: Fetch uploaded file buffer
    S3-->>API: Raw file binary
    API->>DP: parseDocumentBuffer(buffer, mimeType)
    DP-->>API: Extracted text & chunk array
    API->>DB: Save Resource record & ingested chunks
    API-->>Modal: Ingestion successful
```

---

## 3. Grounded AI Study Assistant Request Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant UI as AssistantPage.tsx
    participant API as /api/v1/ai/chat
    participant DB as MongoDB
    participant Gemini as Google Gemini API

    User->>UI: Submit inquiry: "Explain Bellman-Ford algorithm"
    UI->>API: POST /ai/chat { prompt, subjectCode: "CS-201", conversationHistory }
    API->>DB: Query subject units and ingested notes for CS-201
    DB-->>API: Syllabus context & top semantic chunks
    API->>Gemini: Prompt with Grounded Context Envelope
    alt Gemini Available
        Gemini-->>API: Synthesized answer + citations
    else Quota / Timeout
        API->>API: Execute deterministic offline synthesizer
    end
    API-->>UI: 200 OK { response, citations, rateLimit }
    UI-->>User: Render formatted markdown, code blocks, and citations
```

---

## 4. Spaced Repetition Flashcard Review Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Student
    participant Modal as FlashcardDeckModal.tsx
    participant API as /api/v1/ai/flashcards
    participant DB as MongoDB

    User->>Modal: Open flashcard deck for Subject CS-201
    Modal->>API: GET /ai/flashcards?subjectId=...
    API->>DB: Query or generate cards with SM-2 metadata
    DB-->>API: Flashcard records
    API-->>Modal: Card deck (front, back, interval, repetitions, easeFactor)
    User->>Modal: Flip card & rate recall quality (0 to 5)
    Modal->>API: POST /ai/flashcards/:id/review { quality }
    API->>API: Recalculate SM-2 interval & ease factor
    API->>DB: Persist updated review schedule
    API-->>Modal: Confirmation & next due date
```
