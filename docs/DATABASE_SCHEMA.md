# Syllabix Database Schema & Data Models

Primary Database: **MongoDB** (via Mongoose 8 ORM)
Database Name: `syllabix_db`

---

## 1. Subject (`Subject.ts`)
Represents an academic course in the university curriculum.
- `code` (String, required, unique, indexed): e.g., "CS-201"
- `name` (String, required): e.g., "Data Structures & Algorithms"
- `semester` (Number, required, indexed): 1 through 8
- `branchId` (ObjectId / String): Associated engineering department
- `credits` (Number, default: 3)
- `isCore` (Boolean, default: true)
- `units` (Array of sub-documents):
  - `unitNumber` (Number)
  - `title` (String)
  - `topics` (Array of Strings)
  - `hours` (Number)
- `textbooks` (Array of Strings)

---

## 2. Resource (`Resource.ts`)
Uploaded academic notes, past papers, syllabus PDFs, and lab manuals.
- `title` (String, required)
- `subjectId` (ObjectId, ref: 'Subject', required, indexed)
- `ownerId` (String / ObjectId, required, indexed)
- `storagePath` (String, required): Path in Supabase Storage bucket
- `fileType` (String): e.g., "application/pdf"
- `fileSize` (Number)
- `isVerified` (Boolean, default: false)
- `isPrivate` (Boolean, default: false)
- `upvotes` (Number, default: 0)
- `downloadsCount` (Number, default: 0)
- `timestamps` (createdAt, updatedAt)

---

## 3. IngestedChunk (`IngestedChunk.ts`)
Semantic text segments extracted from uploaded documents for AI grounding.
- `resourceId` (ObjectId, ref: 'Resource', required, indexed)
- `subjectId` (ObjectId, ref: 'Subject', required, indexed)
- `chunkIndex` (Number, required)
- `text` (String, required)
- `embedding` (Array of Numbers, optional): Vector embedding array
- `pageNumber` (Number, default: 1)

---

## 4. Discussion (`Discussion.ts`)
Community forum questions.
- `title` (String, required)
- `content` (String, required)
- `subjectId` (ObjectId, ref: 'Subject', required, indexed)
- `authorId` (String, required)
- `authorName` (String, required)
- `upvotes` (Number, default: 0)
- `answersCount` (Number, default: 0)
- `acceptedAnswerId` (ObjectId, ref: 'Comment', optional)
- `tags` (Array of Strings)

---

## 5. Comment (`Comment.ts`)
Answers and replies to community discussions.
- `discussionId` (ObjectId, ref: 'Discussion', required, indexed)
- `authorId` (String, required)
- `authorName` (String, required)
- `content` (String, required)
- `upvotes` (Number, default: 0)
- `isAccepted` (Boolean, default: false)

---

## 6. Flashcard (`Flashcard.ts`)
Spaced repetition flashcards with SuperMemo SM-2 tracking.
- `subjectId` (ObjectId, ref: 'Subject', required, indexed)
- `userId` (String, required, indexed)
- `front` (String, required): Concept prompt or question
- `back` (String, required): Definition or derivation
- `interval` (Number, default: 1): Review interval in days
- `repetitions` (Number, default: 0): Successful reviews count
- `easeFactor` (Number, default: 2.5): SuperMemo multiplier
- `nextReviewDate` (Date, default: Date.now, indexed)

---

## 7. StudyGroup & Mentor
- `StudyGroup`: Represents collaborative peer study rooms with `name`, `subjectId`, `ownerId`, `members`, and `activeCallUrl`.
- `Mentor`: Verified upperclassmen or tutors with `name`, `department`, `expertise`, `rating`, and `hourlyRate`.
