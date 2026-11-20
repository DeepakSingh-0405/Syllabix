# Syllabix — AI-Powered Academic Knowledge & Collaboration Platform

> **Product tagline:** Learn together. Find better resources. Study smarter.  
> **Product category:** Multi-institution academic resource sharing, collaboration, and AI-assisted learning platform.  
> **Document purpose:** This file is the source-of-truth project brief for developers, coding assistants, and other AI agents.

---

## 1. Project Identity

### 1.1 Name

**Syllabix**

The name combines the idea of a *syllabus* with an interconnected academic knowledge system. It represents a platform where learning resources, students, subjects, and academic knowledge are connected.

**Positioning:** Syllabix is not just a file-upload website. It is an academic knowledge network that helps students discover trustworthy study material, learn from their own documents, collaborate with peers, and contribute knowledge to their academic community.

> Naming note: Syllabix is a proposed product name. Check domain, app-store, and trademark availability before public/commercial launch.

### 1.2 Brief Project Description

Syllabix is an AI-powered student resource sharing and academic collaboration platform that centralizes notes, previous-year question papers, assignments, lab manuals, presentations, and other learning materials. Students can discover resources by institution, course, branch, semester, subject, and topic; upload and review materials; bookmark useful content; and collaborate through academic communities. Its AI assistant can answer questions from uploaded documents, summarize notes, generate practice questions and flashcards, identify key topics, and recommend relevant learning resources. A contribution and verification system encourages students to share high-quality material while moderation and reporting tools help maintain trust. The platform is designed to begin with a university-focused student community and later support multiple universities and institutions.

### 1.3 Product Vision

Create one trusted academic destination where students can:

1. **Discover** relevant and well-organized learning resources.
2. **Understand** those resources with AI assistance grounded in the uploaded content.
3. **Collaborate** with peers, seniors, and subject communities.
4. **Contribute** resources and knowledge and receive recognition for quality contributions.

---

## 2. Problem Statement

Academic resources are commonly scattered across messaging groups, cloud folders, college websites, personal drives, and informal student networks. Students spend time searching for material, cannot easily judge its reliability, and often recreate content that already exists. Existing file-sharing tools generally do not understand academic context such as institution, course, semester, subject, syllabus unit, or examination type. They also do not provide learning assistance grounded in the actual documents.

### Problems and Proposed Solutions

| Problem | Impact on students | Syllabix solution |
|---|---|---|
| Resources are scattered across many platforms | Time is wasted searching; useful material gets lost | Central academic resource library with structured metadata |
| Search is not academic-context aware | Students find irrelevant notes or material for another syllabus | Filters for institution, program, branch, semester, subject, unit, year, and resource type |
| Resource quality is uncertain | Incorrect, incomplete, outdated, or duplicate files may be used | Ratings, reviews, reports, moderation, verification labels, and version history |
| Students must read long PDFs to find a topic | Revision becomes slow and inefficient | Document-grounded AI summaries, topic extraction, and question answering |
| Students lack practice material | They may not know what they have understood | AI-generated MCQs, short/long questions, and flashcards with source references |
| Good contributors receive little recognition | Students have less motivation to share quality material | Reputation, contribution history, badges, and leaderboards based on quality |
| Students study in isolated groups | Doubts and useful explanations are not shared broadly | Subject communities, discussions, study groups, and peer answers |
| Juniors have difficulty finding guidance | They may not know which resources or preparation paths are useful | Senior-junior mentorship and peer recommendations |
| Useful resources are hard to discover | Students repeatedly search manually | Personalized recommendations based on academic profile and chosen interests |
| Duplicate or misleading content creates clutter | Search quality and trust decline | Duplicate detection, reporting, review queues, and moderation |

---

## 3. Target Users and Roles

### 3.1 User Types

- **Student:** Searches, views, downloads, bookmarks, uploads, reviews, asks questions, and joins communities.
- **Contributor:** A student who regularly uploads useful resources and builds a reputation.
- **Mentor:** A verified or approved senior/student who offers academic guidance.
- **Moderator:** Reviews reported resources, handles content issues, and verifies material.
- **Institution Admin:** Manages institution-specific information, subjects, academic structure, and moderators.
- **Platform Admin:** Manages the platform, institutions, global policies, users, and system-level analytics.

### 3.2 Role-Based Access Control (RBAC)

Every protected API must check authentication and authorization on the server. Hiding a button in the frontend is not sufficient authorization.

Example permissions:

| Action | Student | Moderator | Institution Admin | Platform Admin |
|---|---:|---:|---:|---:|
| Browse public/authorized resources | Yes | Yes | Yes | Yes |
| Upload own resource | Yes | Yes | Yes | Yes |
| Edit/delete own resource | Yes | Yes | Yes | Yes |
| Review/report resources | Yes | Yes | Yes | Yes |
| Moderate reported resources | No | Yes | Yes | Yes |
| Manage institution subjects | No | Limited | Yes | Yes |
| Manage platform-wide settings | No | No | No | Yes |

Mentor permissions should be granted through an explicit mentor status, not assumed from a student's seniority.

---

## 4. Unique Features and the Problems They Solve

The features below describe the intended product. They are not all assumed to be implemented in the current codebase.

### 4.1 Core Academic Resource Library

**Features**
- Upload PDFs, DOC/DOCX, PPT/PPTX, images, and other explicitly allowed formats.
- Resource categories: lecture notes, PYQs, assignments, lab manuals, practical files, presentations, reference material, handwritten notes, and interview preparation.
- Academic metadata: institution, university, program, branch, semester, subject, unit/topic, academic year, resource type, language, and description.
- Search by title, description, subject, tags, and topic.
- Filters, sorting, pagination, bookmarks, downloads, and recently viewed resources.
- Resource ownership and owner-controlled editing/deletion.
- Resource version history so corrected material can replace or supersede an older version without losing context.

**Problem solved:** Academic material is scattered and difficult to search in a way that reflects a student's actual course and syllabus.

### 4.2 AI Document Understanding and Auto-Tagging

**Features**
- Extract text from uploaded documents.
- Detect likely subject, topics, headings, and keywords.
- Suggest a title, short description, tags, and academic category.
- Detect document language.
- Identify scanned PDFs and route them through OCR when supported.
- Show the uploader the suggested metadata for confirmation before publishing.
- Preserve extraction status and errors for retry.

**Problem solved:** Uploaders often provide incomplete metadata, making resources difficult to discover. Automatic suggestions reduce manual effort and improve search.

**Important rule:** AI-generated metadata is a suggestion. The uploader or moderator must be able to correct it. Do not silently publish uncertain AI classifications as verified facts.

### 4.3 Syllabix AI Study Assistant — Document-Grounded Q&A (RAG)

**Features**
- A student selects one or more resources and asks questions about them.
- Extracted text is split into chunks and indexed with embeddings.
- Relevant chunks are retrieved for each question.
- The LLM answers using retrieved document content.
- Answers include citations such as document name, page number, and relevant section/chunk where available.
- If the documents do not contain the answer, the assistant must say so instead of inventing an answer.
- Students can ask follow-up questions within a conversation.
- Users can see which sources were used.

**Example:** A student uploads Operating Systems notes and asks, "Explain Banker's Algorithm with an example." The assistant retrieves relevant sections from the selected notes, explains the algorithm, and cites the source pages.

**Problem solved:** Students spend too much time searching lengthy documents and may receive generic AI answers that do not match their syllabus or uploaded material.

### 4.4 AI Summaries and Revision Notes

**Features**
- Generate a short overview, detailed summary, or unit-wise summary.
- Extract definitions, formulas, key concepts, and important terms.
- Generate revision sheets.
- Generate structured notes with headings and bullet points.
- Let the student choose summary length and language.
- Provide source references for extracted facts.

**Problem solved:** Students need to revise large documents quickly without losing the context of the original material.

### 4.5 AI Question and Practice Generator

**Features**
- Generate MCQs, true/false, fill-in-the-blanks, and descriptive questions from selected resources.
- Support difficulty levels: easy, medium, and hard.
- Support exam-oriented formats such as 2-mark, 5-mark, and long-answer practice.
- Generate answer keys and explanations.
- Link each question to its source section.
- Allow students to attempt quizzes and review weak areas.
- Store quiz attempts and topic-level performance.

**Problem solved:** Students often lack practice questions based on the exact notes or syllabus they are studying.

**Quality rule:** Generated questions and answers must be reviewable. Clearly label AI-generated content and allow users to report mistakes.

### 4.6 AI Flashcards and Active Recall

**Features**
- Create flashcards from a document, topic, or selected text.
- Generate question/answer cards and definition cards.
- Let users edit, delete, and save generated cards.
- Study using a simple spaced-review schedule.
- Track mastered, learning, and due cards.
- Allow sharing of public flashcard decks.

**Problem solved:** Passive reading does not always help students retain information. Flashcards encourage active recall and repeated revision.

### 4.7 Syllabus Mapping and Topic Coverage

**Features**
- Institution/admin-managed syllabus structure: program → branch → semester → subject → unit → topic.
- Map uploaded resources to one or more syllabus topics.
- Show available resources for each unit.
- Highlight topics with no resources or limited coverage.
- Let students mark topics as studied.
- Recommend resources for uncovered topics.

**Problem solved:** Students cannot easily tell whether they have material for every unit or which parts of a syllabus still need preparation.

### 4.8 Academic Knowledge Graph

**Features**
- Represent subjects, units, topics, concepts, and resources as connected entities.
- Link prerequisite concepts and related topics.
- Show related resources and concepts.
- Let students navigate from a topic to its prerequisites and supporting material.
- Build relationships from admin-defined syllabus data and carefully reviewed AI suggestions.

**Problem solved:** Traditional search returns isolated files and does not help students understand how concepts relate to one another.

**MVP note:** Start with a relational/document-based representation in MongoDB. A dedicated graph database is optional and should only be introduced if actual scale and query needs justify it.

### 4.9 Personalized Resource Recommendations

**Features**
- Recommend resources based on the student's selected institution, branch, semester, and subjects.
- Use explicit interests, bookmarks, searches, and interactions as recommendation signals.
- Recommend related topics and resources.
- Explain why an item is recommended.
- Provide controls to reset or adjust recommendation preferences.

**Problem solved:** Students miss useful material because they do not know it exists or cannot search for every related topic.

**Privacy rule:** Do not infer sensitive personal characteristics. Give users control over personalization and avoid collecting unnecessary behavioral data.

### 4.10 Resource Trust, Reviews, and Verification

**Features**
- Ratings and written reviews.
- Helpful/not-helpful feedback.
- Report resource for incorrect, duplicate, unsafe, copyrighted, or misleading content.
- Moderator review queue.
- Verification status: unreviewed, under review, verified, rejected, or outdated.
- Version history and update notes.
- Contributor reputation based on useful, reviewed contributions rather than raw upload count.
- AI-assisted duplicate similarity detection to flag likely duplicates for human review.

**Problem solved:** Students need a way to assess whether material is useful, current, and trustworthy.

**Important rule:** A high rating or AI score is not proof of correctness. Verification must have a clear human review process.

### 4.11 Academic Communities and Doubt Discussions

**Features**
- Communities by institution, branch, semester, subject, or topic.
- Ask a doubt, post an explanation, and reply to answers.
- Upvote helpful answers.
- Attach a resource to a discussion.
- Mark an answer as accepted.
- Search previous discussions.
- Report spam or abusive content.
- Real-time notifications for replies and mentions.

**Problem solved:** Academic questions are fragmented across private groups, and useful explanations are difficult for other students to find later.

### 4.12 Collaborative Study Groups

**Features**
- Create public or private study groups.
- Invite members and manage membership.
- Set a subject, goal, and study schedule.
- Share resources and flashcard decks.
- Maintain group tasks and progress.
- Use real-time group chat or discussion threads.
- Allow group moderators to manage content.

**Problem solved:** Students find it difficult to coordinate study with peers and keep shared material organized.

### 4.13 Senior-Junior Mentorship

**Features**
- Optional mentor profiles and areas of expertise.
- Mentorship requests and acceptance workflow.
- Subject, project, and placement-preparation guidance categories.
- Session scheduling or discussion threads.
- Feedback and reporting.
- Verified affiliation where institution verification is available.

**Problem solved:** Juniors often lack access to reliable guidance from seniors who have already studied the subject or completed the relevant academic milestone.

### 4.14 Contribution, Reputation, and Gamification

**Features**
- Contribution history.
- Badges for quality uploads, helpful answers, and verified resources.
- Institution/subject leaderboards.
- Monthly contribution highlights.
- Reputation points weighted by quality signals.
- Anti-spam limits and moderator controls.

**Problem solved:** Students who contribute high-quality resources receive little recognition, reducing motivation to share.

**Abuse prevention:** Do not award large amounts of points for upload volume alone. Apply rate limits, duplicate checks, and moderation.

### 4.15 Notifications and Academic Activity Feed

**Features**
- In-app notifications for resource review status, replies, mentions, group invitations, and mentorship requests.
- Email notifications as an optional future integration.
- User notification preferences.
- Activity feed for followed subjects and communities.
- Read/unread status.

**Problem solved:** Students miss relevant updates and responses when academic activity is spread across different channels.

### 4.16 Admin and Institution Analytics

**Features**
- Resource upload and usage trends.
- Most searched subjects and topics.
- Resource reports and moderation queue.
- Active communities and contribution metrics.
- Topic coverage gaps.
- Institution-level activity dashboards.
- Exportable aggregate reports.

**Problem solved:** Moderators and institutions lack visibility into which academic resources are available, which topics are underserved, and where moderation is needed.

---

## 5. Recommended MVP Scope

Do not build every feature at once. Deliver a working, reliable resource platform first.

### MVP — Release 1
1. Registration, login, logout, and profile.
2. Institution, branch, semester, and subject selection.
3. Resource upload with metadata.
4. Resource listing, search, filters, sorting, and pagination.
5. Resource detail, view, and authorized download.
6. Bookmarks.
7. Ratings and reviews.
8. Owner-controlled resource editing/deletion.
9. Basic reporting and admin moderation.
10. Responsive dashboard.

### AI Release — Release 2
1. PDF text extraction.
2. AI-generated metadata suggestions.
3. Document summaries.
4. RAG-based question answering with source citations.
5. MCQ and descriptive question generation.
6. Flashcard generation.
7. AI usage limits and error handling.

### Community Release — Release 3
1. Subject communities and doubt discussions.
2. Study groups.
3. Real-time notifications.
4. Contribution reputation and badges.
5. Mentorship workflow.

### Intelligence and Scale — Release 4
1. Syllabus mapping and coverage.
2. Personalized recommendations.
3. Knowledge graph navigation.
4. Institution analytics.
5. Multi-institution onboarding and advanced moderation.

---

## 6. Technology Stack — MERN-Based

The platform must use the **MERN stack** as its primary application stack.

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | React + Vite | Single-page web application |
| Frontend language | TypeScript (recommended) or JavaScript | Typed/maintainable frontend code |
| UI | Tailwind CSS + Shadcn UI | Responsive design and reusable components |
| Routing | React Router | Client-side navigation and protected routes |
| State management | Redux Toolkit or React Context | Shared application state |
| Backend | Node.js | JavaScript runtime |
| API framework | Express.js | REST API, middleware, and route handling |
| Database | MongoDB | Users, resources, academic metadata, discussions, and activity |
| ODM/ORM | Prisma with MongoDB connector, if compatible with the selected Prisma version | Database access and schema management |
| Authentication | Supabase Auth (JWT access tokens, OAuth providers, MFA, session management synced to MongoDB user model) | Secure user authentication and identity management |
| File storage | Supabase Storage (S3-compatible object storage with signed URLs) | Uploaded documents, syllabus copies, lecture notes, and images |
| Real-time | Supabase Realtime or Socket.IO | Live discussions, doubt resolution, presence, and instant notifications |
| Cache / queue | Redis | Caching, rate limits, and job coordination |
| Background jobs | BullMQ | Document processing, embeddings, notifications, and AI tasks |
| AI provider | Gemini API or another replaceable LLM provider | Summaries, question generation, classification, and Q&A |
| Embeddings | Embedding model from selected AI provider | Semantic document retrieval |
| Vector search | MongoDB Atlas Vector Search or a dedicated vector database | Retrieval-Augmented Generation |
| PDF processing | PDF parsing library; OCR service for scanned documents | Text extraction |
| API documentation | OpenAPI / Swagger | API contract and developer documentation |
| Validation | Zod or Joi | Request and data validation |
| Testing | Vitest/Jest, Supertest, and Playwright | Unit, API integration, and end-to-end tests |
| Deployment | Vercel for frontend; Render/AWS or equivalent for API and workers | Hosting |
| Containers | Docker | Reproducible services and deployment |
| CI/CD | GitHub Actions | Automated checks and deployment |

### Stack Decisions and Constraints

- This is a **MERN** application: MongoDB, Express.js, React, and Node.js.
- AI functionality is an integrated service, not a replacement for the MERN backend.
- Keep AI provider calls on the backend. Never expose private API keys in frontend code.
- Keep file binaries in object storage; store file metadata and storage keys in MongoDB.
- Use a background worker for expensive document extraction, OCR, embedding, and AI tasks. Do not make the upload HTTP request wait for all processing to finish.
- Choose one authentication strategy and implement it consistently. Do not mix multiple session systems without a clear reason.
- If Prisma's MongoDB support or a particular feature does not meet the chosen version's requirements, use the MongoDB Node.js driver or Mongoose for that repository. Do not force incompatible tooling.
- Redis, BullMQ, Socket.IO, and vector search can be introduced incrementally; they are not prerequisites for the first MVP.

---

## 7. High-Level System Architecture

### 7.1 Architecture Diagram

```mermaid
flowchart TB
    U[Student / Mentor / Moderator / Admin]
    FE[React + Vite Frontend]
    API[Node.js + Express REST API]
    AUTH[Authentication + RBAC]
    DB[(MongoDB)]
    FILES[(Object Storage)]
    REDIS[(Redis)]
    QUEUE[BullMQ Job Queue]
    WORKER[Document Processing Worker]
    EXTRACT[PDF Parser / OCR]
    EMBED[Embedding Service]
    VECTOR[(Vector Search Index)]
    AI[LLM Provider: Gemini or equivalent]
    WS[Socket.IO Server]

    U --> FE
    FE -->|HTTPS REST| API
    FE <-->|WebSocket| WS
    API --> AUTH
    API <--> DB
    API --> FILES
    API <--> REDIS
    API --> QUEUE
    QUEUE --> WORKER
    WORKER --> FILES
    WORKER --> EXTRACT
    EXTRACT --> EMBED
    EMBED --> VECTOR
    API -->|AI request / retrieved context| AI
    API --> VECTOR
    API --> WS
    WS --> FE
```

### 7.2 Architecture Responsibilities

**React frontend**
- Renders pages and reusable UI components.
- Collects user input and performs client-side validation.
- Calls backend APIs.
- Displays upload and AI-processing status.
- Maintains UI state and authenticated navigation.
- Must not contain database credentials, storage secrets, or private AI keys.

**Express API**
- Exposes versioned REST endpoints.
- Authenticates users and enforces RBAC.
- Validates request bodies, query parameters, and uploaded file metadata.
- Applies business rules.
- Reads/writes MongoDB.
- Issues background jobs.
- Coordinates AI and vector retrieval services.
- Returns consistent response and error formats.

**MongoDB**
- Stores users, academic structures, resource metadata, reviews, bookmarks, discussions, groups, notifications, and processing state.
- Uses indexes for frequent filters and search.
- Stores file references, not large binary document contents.

**Object storage**
- Stores original files and generated artifacts.
- Uses private access by default.
- Serves files through authorized, short-lived URLs or a controlled download endpoint.

**Background worker**
- Extracts document text.
- Runs OCR when required.
- Creates chunks and embeddings.
- Generates optional metadata suggestions.
- Updates processing status and failure information.
- Retries transient failures safely.

**AI service**
- Performs classification, summarization, question generation, flashcard generation, and RAG answer generation.
- Is called only from trusted backend code.
- Must use prompt and output validation, quotas, and error handling.

**Socket.IO**
- Delivers real-time notifications and community/group events.
- Must authenticate socket connections and verify room membership before allowing access.

---

## 8. Key User Flows

### 8.1 Registration and Onboarding

```mermaid
flowchart TD
    A[Open Syllabix] --> B[Register / Login]
    B --> C[Backend validates credentials]
    C --> D[Create or load user profile]
    D --> E[Select institution]
    E --> F[Select program, branch, semester]
    F --> G[Select subjects and interests]
    G --> H[Save academic profile]
    H --> I[Open personalized dashboard]
```

1. User registers or logs in.
2. Backend validates identity and creates/loads the profile.
3. User selects institution and academic details.
4. User selects subjects/interests.
5. Backend stores the profile.
6. Dashboard displays relevant resources and communities.

### 8.2 Resource Upload and AI Processing

```mermaid
flowchart TD
    A[Student selects file] --> B[Frontend validates basic file rules]
    B --> C[POST upload request]
    C --> D[Backend authenticates and authorizes]
    D --> E[Validate file type, size, and metadata]
    E --> F[Store file in object storage]
    F --> G[Create Resource record: PROCESSING]
    G --> H[Enqueue document-processing job]
    H --> I[Return resource ID and processing status]
    I --> J[Worker extracts text / OCR]
    J --> K[Detect subject, topics, and keywords]
    K --> L[Create chunks and embeddings]
    L --> M[Save extraction metadata and vector references]
    M --> N[Set resource status: READY or NEEDS_REVIEW]
    N --> O[Notify uploader]
    O --> P[Uploader reviews suggested metadata]
    P --> Q[Publish resource]
```

Rules:
- Validate MIME type and file signature where possible; do not trust the filename extension alone.
- Enforce file size and allowed-format limits.
- Store the file privately until authorization is checked.
- Use a processing status such as `UPLOADED`, `PROCESSING`, `READY`, `FAILED`, `NEEDS_REVIEW`, or `REJECTED`.
- Make processing jobs idempotent so retries do not create duplicate chunks or embeddings.
- If AI extraction fails, preserve the uploaded file and allow retry or manual metadata entry.
- The uploader confirms AI-suggested metadata before it is treated as final.

### 8.3 AI Question Answering (RAG)

```mermaid
flowchart TD
    A[Student selects document(s)] --> B[Enter question]
    B --> C[Backend authenticates and checks document access]
    C --> D[Convert question into embedding]
    D --> E[Retrieve relevant chunks]
    E --> F[Apply access and relevance filters]
    F --> G[Build grounded prompt with source context]
    G --> H[Call LLM]
    H --> I[Validate answer and citations]
    I --> J[Return answer with source references]
    J --> K[Student asks follow-up or rates answer]
```

RAG requirements:
1. Only retrieve chunks from documents the current user is allowed to access.
2. Include source metadata such as resource ID, title, page, and chunk ID.
3. Instruct the model to answer only from the retrieved context for document-grounded questions.
4. If the context is insufficient, return an explicit "not found in the selected material" response.
5. Treat uploaded documents as untrusted data. Ignore instructions embedded in documents that attempt to override system or developer instructions.
6. Do not claim citations that do not exist in retrieved source metadata.
7. Apply rate limits, token limits, and per-user AI usage quotas.

### 8.4 Search and Discovery

1. Student enters a keyword or chooses academic filters.
2. Frontend sends query, filters, sort, and pagination parameters.
3. API validates and normalizes the query.
4. Database search uses indexed metadata and text search.
5. Optional semantic search retrieves conceptually related resources.
6. API applies visibility, moderation, and institution access rules.
7. Frontend displays results with resource metadata, status, ratings, and actions.

### 8.5 Review and Moderation

1. Student submits a rating/review or reports a resource.
2. API validates ownership, eligibility, and duplicate submissions.
3. Report is added to a moderation queue.
4. Moderator reviews the resource and report evidence.
5. Moderator chooses an action: no action, request correction, mark outdated, hide, reject, or verify.
6. API records moderator, timestamp, reason, and audit event.
7. Relevant users receive notifications.

---

## 9. Suggested Frontend Pages

| Page | Purpose |
|---|---|
| Landing Page | Explain platform value and provide entry points |
| Register / Login | Authentication |
| Onboarding | Institution and academic profile setup |
| Dashboard | Personalized overview, recent resources, recommendations |
| Resource Explorer | Search and filter academic material |
| Resource Details | Preview metadata, ratings, reviews, versions, and actions |
| Upload Resource | Upload file and enter metadata |
| My Contributions | Manage uploaded resources and processing status |
| Bookmarks | Saved resources |
| AI Study Assistant | Document Q&A, summaries, quizzes, and flashcards |
| Syllabus Explorer | Subjects, units, topics, and resource coverage |
| Communities | Subject/institution discussion spaces |
| Discussion Details | Questions, replies, accepted answers |
| Study Groups | Group discovery, membership, and shared study activity |
| Mentorship | Mentor discovery and requests |
| Notifications | Activity and alerts |
| Profile | Academic profile, contributions, preferences |
| Moderator Dashboard | Review reports and resource verification |
| Institution Admin | Manage institution structure and analytics |
| Platform Admin | Global administration and system metrics |

---

## 10. Suggested Backend Module Structure

Use a modular monolith initially. Keep modules separated by domain so they can be extracted into services later if scale requires it.

```text
server/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── database.ts
│   │   ├── storage.ts
│   │   └── redis.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── institutions/
│   │   ├── academic-structure/
│   │   ├── subjects/
│   │   ├── resources/
│   │   ├── uploads/
│   │   ├── document-processing/
│   │   ├── ai-assistant/
│   │   ├── search/
│   │   ├── recommendations/
│   │   ├── bookmarks/
│   │   ├── reviews/
│   │   ├── reports/
│   │   ├── moderation/
│   │   ├── discussions/
│   │   ├── study-groups/
│   │   ├── mentorship/
│   │   ├── contributions/
│   │   ├── notifications/
│   │   └── analytics/
│   ├── jobs/
│   │   ├── queues/
│   │   └── workers/
│   ├── sockets/
│   ├── middleware/
│   ├── shared/
│   │   ├── errors/
│   │   ├── validation/
│   │   ├── logger/
│   │   └── utils/
│   └── tests/
├── prisma/                 # If Prisma is selected for MongoDB
├── package.json
└── .env.example
```

A typical domain module should separate:
- `*.routes`: endpoint definitions.
- `*.controller`: HTTP request/response handling.
- `*.service`: business logic.
- `*.repository`: database access, where useful.
- `*.schema`: request validation and domain schemas.
- `*.types`: shared types.
- `*.test`: tests.

Frontend structure:

```text
client/
├── src/
│   ├── app/
│   │   ├── router/
│   │   ├── store/
│   │   └── providers/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── resources/
│   │   ├── upload/
│   │   ├── ai-assistant/
│   │   ├── syllabus/
│   │   ├── communities/
│   │   ├── study-groups/
│   │   ├── mentorship/
│   │   ├── notifications/
│   │   └── profile/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   └── main.tsx
├── public/
└── package.json
```

---

## 11. Core Data Model / Collections

The following is a conceptual data model. Exact fields, indexes, and relations must be finalized during implementation.

| Collection / Model | Purpose | Important fields |
|---|---|---|
| `User` | Account and profile | `name`, `email`, `passwordHash` or auth provider ID, `role`, `institutionId`, `academicProfile`, `status` |
| `Institution` | College/university | `name`, `type`, `domain`, `status` |
| `Program` | Academic program | `institutionId`, `name`, `level` |
| `Branch` | Department/branch | `programId`, `name`, `code` |
| `Semester` | Academic term | `programId`, `number`, `label` |
| `Subject` | Subject/course | `institutionId`, `branchId`, `semesterId`, `code`, `name` |
| `Unit` | Subject unit | `subjectId`, `number`, `title` |
| `Topic` | Syllabus topic | `unitId`, `title`, `description`, `prerequisiteTopicIds` |
| `Resource` | Uploaded academic item | `ownerId`, `title`, `description`, `resourceType`, `subjectId`, `topicIds`, `storageKey`, `mimeType`, `status`, `visibility` |
| `ResourceVersion` | Resource revision | `resourceId`, `version`, `storageKey`, `changeNote`, `createdBy` |
| `DocumentJob` | Extraction/AI job state | `resourceId`, `jobType`, `status`, `attempts`, `errorCode` |
| `DocumentChunk` | Extracted text chunk | `resourceId`, `versionId`, `chunkIndex`, `text`, `pageNumber`, `embeddingRef` |
| `Bookmark` | Saved resource | `userId`, `resourceId`, `createdAt` |
| `DownloadEvent` | Download analytics | `userId`, `resourceId`, `createdAt` |
| `ResourceReview` | Rating and review | `userId`, `resourceId`, `rating`, `comment` |
| `ResourceReport` | Reported content | `reporterId`, `resourceId`, `reason`, `details`, `status` |
| `ModerationAction` | Audit of moderation | `moderatorId`, `targetType`, `targetId`, `action`, `reason`, `createdAt` |
| `Discussion` | Academic question/post | `authorId`, `communityId`, `subjectId`, `title`, `body`, `status` |
| `Comment` | Discussion reply | `discussionId`, `authorId`, `body`, `parentCommentId`, `isAcceptedAnswer` |
| `Community` | Academic group | `name`, `institutionId`, `subjectId`, `visibility` |
| `CommunityMember` | Membership | `communityId`, `userId`, `role`, `joinedAt` |
| `StudyGroup` | Collaborative study group | `name`, `subjectId`, `ownerId`, `visibility`, `schedule` |
| `StudyGroupMember` | Group membership | `studyGroupId`, `userId`, `role` |
| `MentorProfile` | Mentorship details | `userId`, `expertise`, `availability`, `verificationStatus` |
| `MentorshipRequest` | Mentorship workflow | `mentorId`, `studentId`, `message`, `status` |
| `AIConversation` | Assistant conversation | `userId`, `title`, `selectedResourceIds` |
| `AIMessage` | Conversation messages | `conversationId`, `role`, `content`, `sourceRefs`, `createdAt` |
| `Quiz` | Generated or authored quiz | `creatorId`, `resourceIds`, `title`, `difficulty`, `questions` |
| `QuizAttempt` | Student attempt | `quizId`, `userId`, `answers`, `score`, `createdAt` |
| `FlashcardDeck` | Flashcard collection | `ownerId`, `title`, `resourceIds`, `visibility` |
| `Flashcard` | Individual card | `deckId`, `front`, `back`, `sourceRef` |
| `Notification` | User notification | `userId`, `type`, `payload`, `readAt` |
| `ContributionEvent` | Reputation event | `userId`, `eventType`, `targetId`, `points`, `status` |

### Data Modeling Rules

- Use stable IDs and consistent naming.
- Add `createdAt` and `updatedAt` to mutable entities.
- Add indexes for common filters: institution, branch, semester, subject, resource type, status, and creation date.
- Add unique compound indexes where needed, for example one bookmark per `(userId, resourceId)` and one review per `(userId, resourceId)` if the product permits only one review.
- Validate all referenced IDs and ownership on the backend.
- Avoid storing large binary files or base64 documents in MongoDB.
- Define data retention and deletion behavior for user accounts and uploaded files.
- Keep audit records for moderation-sensitive actions.

---

## 12. API Design — Initial Endpoint Map

Use a versioned prefix such as `/api/v1`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh session |
| POST | `/auth/logout` | Logout |
| GET | `/users/me` | Current user profile |
| PATCH | `/users/me` | Update profile |
| GET | `/institutions` | List/search institutions |
| GET | `/academic/subjects` | List subjects using academic filters |
| POST | `/resources` | Create resource metadata / initiate upload |
| GET | `/resources` | Search and filter resources |
| GET | `/resources/:id` | Resource details |
| PATCH | `/resources/:id` | Update own resource |
| DELETE | `/resources/:id` | Delete/archive own resource |
| POST | `/resources/:id/bookmark` | Bookmark resource |
| DELETE | `/resources/:id/bookmark` | Remove bookmark |
| POST | `/resources/:id/reviews` | Submit review |
| POST | `/resources/:id/reports` | Report resource |
| GET | `/resources/:id/download` | Request authorized download |
| GET | `/resources/:id/processing-status` | Get document processing status |
| POST | `/ai/resources/:id/summarize` | Generate summary |
| POST | `/ai/ask` | Ask question over selected resources |
| POST | `/ai/resources/:id/generate-quiz` | Generate practice questions |
| POST | `/ai/resources/:id/generate-flashcards` | Generate flashcards |
| GET | `/discussions` | List/search discussions |
| POST | `/discussions` | Create discussion |
| POST | `/discussions/:id/comments` | Add comment |
| POST | `/communities` | Create community |
| POST | `/study-groups` | Create study group |
| POST | `/mentorship/requests` | Request mentorship |
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark notification read |
| GET | `/moderation/reports` | Moderator report queue |
| PATCH | `/moderation/reports/:id` | Resolve report |
| GET | `/admin/analytics` | Authorized admin analytics |

API implementation rules:
- Validate every input with a schema.
- Use consistent status codes and error response structures.
- Apply authentication and RBAC middleware to protected routes.
- Add pagination to list endpoints.
- Enforce ownership and institution visibility in service/database queries.
- Add rate limits to authentication, uploads, search, and AI endpoints.
- Never trust a client-supplied role, owner ID, institution permission, or file storage key.

Example error response:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource could not be found."
  }
}
```

---

## 13. Security, Privacy, and Content Safety

1. Hash passwords using a modern password-hashing algorithm if passwords are managed by the application.
2. Use secure, HTTP-only cookies for refresh tokens where applicable; configure SameSite and Secure flags appropriately.
3. Protect against XSS, CSRF, injection, broken access control, and unsafe file uploads.
4. Validate file size, MIME type, file signature, and allowed extension.
5. Scan uploaded files where a suitable scanning service is available.
6. Store private documents in private buckets and issue short-lived access URLs only after authorization.
7. Apply per-user and per-IP rate limits.
8. Keep secrets in environment variables or a secret manager.
9. Do not log passwords, tokens, private document content, or unnecessary personal data.
10. Enforce document-level access during search, vector retrieval, previews, and downloads.
11. Treat uploaded document text as untrusted prompt input. Defend against prompt injection.
12. Clearly label AI-generated content and show sources when available.
13. Provide reporting, moderation, takedown, and appeal workflows.
14. Respect copyright. Do not encourage unauthorized distribution of paid books, copyrighted course packs, or restricted material. Provide reporting and removal processes.
15. Provide account deletion and appropriate data/file deletion workflows.
16. Collect only the personal data needed to operate the service.

---

## 14. Non-Functional Requirements

- **Usability:** Responsive, accessible, and understandable on mobile and desktop.
- **Performance:** Paginate large result sets, index common filters, and avoid loading entire documents into API memory.
- **Reliability:** Background jobs must support retries and clear failure states.
- **Scalability:** Begin with a modular monolith; split services only when justified by measured load or team boundaries.
- **Maintainability:** Use consistent naming, module boundaries, typed contracts, linting, and tests.
- **Observability:** Structured logs, error tracking, job metrics, and API latency monitoring.
- **Security:** Enforce server-side authorization and protect uploaded documents.
- **AI quality:** Ground document answers in retrieved sources, show uncertainty, and avoid fabricated citations.
- **Cost control:** Use quotas, caching where appropriate, model selection by task, and background processing.
- **Accessibility:** Keyboard navigation, readable contrast, labels, and semantic HTML.

---

## 15. AI Agent Implementation Instructions

This section is specifically written for an AI coding agent or autonomous development assistant.

### 15.1 Source-of-Truth Rules

- Treat this document as the intended product specification.
- Do not assume every described feature already exists.
- Before changing code, inspect the repository and identify the current implementation.
- Preserve working functionality unless the requested change requires modification.
- Do not replace the entire application or rewrite the architecture without a clear reason.
- If the repository has legacy Appwrite or Clerk dependencies for authentication, database, or storage, inspect their current usage before proposing migration. The target architecture in this specification is MERN with Supabase (Supabase Auth, Supabase Storage, and Supabase Realtime); migrate deliberately and incrementally to keep MongoDB as the single source of truth for application data.
- Keep implemented features, planned features, and incomplete features clearly distinguished in project documentation.

### 15.2 Existing SRSP Context to Preserve

The earlier SRSP implementation was described as using:
- React with Vite.
- React Router DOM v6.
- Tailwind CSS.
- Lucide React icons.
- Legacy Appwrite / Clerk Authentication and Storage (migrated to Supabase Auth and Supabase Storage).
- Authentication context/session checks and protected routes.
- Home and Resources routes, an authentication flow, a placeholder AI Hub, and a protected upload flow.
- Resource search/filtering by title, description, semester, and batch.
- PDF upload with metadata.
- Ratings, owner-only deletion, and authenticated viewing/downloads.

These are historical project details, not a guarantee about the current repository state. Inspect the actual code before relying on them.

### 15.3 MERN Target-State Rule

The requested target stack is MERN enhanced with Supabase:
- MongoDB database (via Mongoose / Atlas Vector Search).
- Express.js API (REST endpoints, Zod validation, Supabase JWT verification middleware).
- Node.js backend runtime & BullMQ worker.
- React frontend (Vite, TypeScript, Tailwind CSS, Shadcn UI, Supabase client).
- Supabase services: Supabase Auth (replacing Clerk), Supabase Storage (replacing Appwrite Storage), and Supabase Realtime (replacing Appwrite Realtime).

If the current repository has lingering Appwrite/Clerk configurations, execute the staged migration plan:
1. Audit existing Appwrite/Clerk configs, auth webhooks, storage buckets, and routes.
2. Define the MongoDB data model and Express API contracts.
3. Integrate Supabase Auth for frontend login/signup and Express JWT validation.
4. Configure Supabase Storage buckets for private document management with signed URLs.
5. Setup Supabase Realtime for live discussions and doubt comments.
6. Migrate or adapt user identity and academic profiles into MongoDB safely.
7. Preserve access control and existing user-owned resource behavior.
8. Verify all existing user flows before removing old dependencies.

Do not run a destructive migration without a verified backup and an explicit migration plan.

### 15.4 Coding Agent Workflow

For every task:
1. Read this specification and inspect relevant source files.
2. Identify the exact feature, dependencies, and affected modules.
3. Summarize the planned changes before large or risky modifications.
4. Follow the existing code style and architecture where practical.
5. Implement backend validation and authorization before relying on frontend restrictions.
6. Add or update tests.
7. Run linting, type checking, tests, and build commands available in the repository.
8. Report changed files, behavior, tests run, and known limitations.
9. Update documentation when API contracts, environment variables, or workflows change.

### 15.5 Engineering Constraints

- Do not hardcode secrets or API keys.
- Do not expose private AI provider keys to the browser.
- Do not trust client-side roles or permissions.
- Do not make AI-generated metadata automatically verified.
- Do not let RAG retrieve documents the user cannot access.
- Do not store uploaded file binaries as base64 strings in MongoDB.
- Do not put long-running AI/document processing inside synchronous upload requests.
- Do not introduce microservices prematurely.
- Do not add dependencies without explaining their purpose.
- Do not remove existing functionality without identifying the impact.
- Prefer small, reviewable, testable changes.

### 15.6 Environment Variables

Create `.env.example` with placeholder values only. Actual secrets must never be committed.

Suggested variables:

```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
REDIS_URL=
AI_PROVIDER=
AI_API_KEY=
AI_MODEL=
EMBEDDING_MODEL=
OBJECT_STORAGE_PROVIDER=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
OBJECT_STORAGE_ENDPOINT=
```

Add only variables required by the selected implementation. Validate required environment variables at server startup and fail with a clear configuration error.

---

## 16. Suggested Development Milestones and Acceptance Criteria

### Milestone 1 — Foundation
- React app and Express API run locally.
- MongoDB connection works.
- Environment validation and centralized error handling exist.
- Registration/login and server-side authorization work.
- Protected routes are implemented.

**Acceptance:** Unauthorized users cannot access protected API data by manually calling endpoints.

### Milestone 2 — Resource Sharing
- Upload, metadata, listing, search, filters, detail view, download, bookmarks, and owner management work.
- File storage is private and access-controlled.
- Resource status and validation are visible.

**Acceptance:** A student can upload a valid resource, find it using academic filters, bookmark it, and access it only according to visibility rules.

### Milestone 3 — Trust and Moderation
- Reviews, reports, moderator queue, status changes, and audit records work.

**Acceptance:** A student can report a resource and an authorized moderator can resolve it with a recorded reason.

### Milestone 4 — AI Document Pipeline
- Background extraction, chunking, embeddings, and processing status work.
- Failed jobs can be retried safely.

**Acceptance:** Uploading a supported PDF creates searchable document chunks without blocking the upload request.

### Milestone 5 — AI Learning
- RAG Q&A returns source references.
- Summary and question generation work.
- Usage quotas and error handling exist.

**Acceptance:** When a selected document does not contain the answer, the assistant clearly states that the answer is not available in the source rather than inventing it.

### Milestone 6 — Collaboration
- Discussions, communities, study groups, and notifications work.

**Acceptance:** Users can participate only in communities/groups they are authorized to access.

### Milestone 7 — Personalization and Scale
- Recommendations, syllabus mapping, analytics, and performance improvements are added.

**Acceptance:** Recommendations respect user preferences and access rules, and list/search APIs remain paginated and indexed.

---

## 17. Success Metrics

Measure product usefulness rather than vanity metrics alone.

- Resource search success rate.
- Percentage of searches that lead to a resource view or download.
- Number of resources with complete academic metadata.
- Percentage of resources reviewed or verified.
- Duplicate/report rate.
- AI answer helpfulness rating.
- Percentage of AI answers with valid source references.
- AI answer failure or unsupported-answer rate.
- Weekly active students.
- Repeat usage and returning contributors.
- Discussion questions receiving helpful answers.
- Median time from upload to resource availability.
- Document processing failure rate.

---

## 18. Final Product Summary

**Syllabix** is a MERN-based, AI-powered academic knowledge and collaboration platform. It solves the fragmentation of student learning resources by organizing material around institutions, branches, semesters, subjects, units, and topics. It adds document-grounded AI assistance, summaries, practice generation, flashcards, syllabus coverage, resource verification, academic communities, mentorship, and contribution incentives.

The product should launch with a reliable resource-sharing MVP, then add AI document intelligence and collaboration in controlled phases. Its long-term goal is to become a trusted, multi-institution academic knowledge network.

**Core product pillars:**
- **Discover:** Find relevant academic resources.
- **Understand:** Learn from documents with grounded AI.
- **Practice:** Generate quizzes and flashcards.
- **Collaborate:** Discuss, study, and mentor.
- **Contribute:** Share quality knowledge and build reputation.

---

## 19. Glossary

| Term | Meaning |
|---|---|
| MERN | MongoDB, Express.js, React, Node.js |
| RBAC | Role-Based Access Control |
| RAG | Retrieval-Augmented Generation; retrieve relevant source content before generating an AI answer |
| Embedding | Numeric representation of text used for semantic similarity search |
| Vector search | Search for semantically similar text using embeddings |
| OCR | Optical Character Recognition; extracts text from scanned images/documents |
| BullMQ | Redis-backed Node.js job queue |
| Socket.IO | Real-time, event-based client/server communication |
| MVP | Minimum Viable Product; smallest useful release |
| Syllabus mapping | Connecting resources to official subjects, units, and topics |
| Idempotent job | A job that can safely run more than once without creating duplicate effects |
