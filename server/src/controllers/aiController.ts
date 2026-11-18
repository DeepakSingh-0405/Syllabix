import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/auth';
import { Resource } from '../models/Resource';
import { Subject } from '../models/Academic';
import { DocumentChunk, cosineSimilarity } from '../models/DocumentChunk';
import { FlashcardDeck, Flashcard } from '../models/Flashcard';
import { geminiService } from '../services/geminiService';
import { cacheService } from '../services/redisService';
import { getCurriculumBySubject, getCurriculumContext } from '../data/curriculumData';

/**
 * Helper to gather rich textual context from uploaded documents, chunks, and curriculum knowledge base.
 * Prioritizes direct scanned text and resource-specific chunks when resourceId is supplied.
 */
async function gatherSubjectContext(
  subjectId: string,
  resourceId?: string,
  scannedDocumentText?: string
): Promise<{
  subject: any;
  contextText: string;
  resourceTitles: string[];
  chunks: any[];
}> {
  let subject: any = null;
  let targetResource: any = null;

  // 1. If resourceId is supplied, fetch the resource first to identify the subject
  if (resourceId && mongoose.Types.ObjectId.isValid(resourceId)) {
    try {
      targetResource = await Resource.findById(resourceId).lean();
      if (targetResource && targetResource.subjectId) {
        subject = await Subject.findById(targetResource.subjectId).lean();
      }
    } catch (err) {
      console.warn('[AIController] Error finding resource by ID:', err);
    }
  }

  // 2. Resolve subject by subjectId (ObjectId, code, or name)
  if (!subject && subjectId) {
    if (mongoose.Types.ObjectId.isValid(subjectId)) {
      try {
        subject = await Subject.findById(subjectId).lean();
      } catch (err) {
        console.warn('[AIController] Error finding subject by ObjectId:', err);
      }
    }
    if (!subject) {
      try {
        subject = await Subject.findOne({
          $or: [{ code: subjectId.toUpperCase() }, { name: new RegExp(subjectId, 'i') }],
        }).lean();
      } catch (err) {
        console.warn('[AIController] Error finding subject by code/name:', err);
      }
    }
  }

  // 3. Fallback to curriculumData if subject not found in MongoDB
  const fallbackCurriculum = getCurriculumBySubject(subject?.code || subjectId, subject?.name);
  if (!subject) {
    if (fallbackCurriculum) {
      subject = {
        _id: new mongoose.Types.ObjectId('65000000000000000000000' + (fallbackCurriculum.code.slice(-1) || '1')),
        name: fallbackCurriculum.name,
        code: fallbackCurriculum.code,
        description: fallbackCurriculum.description,
        semester: fallbackCurriculum.semester,
        credits: fallbackCurriculum.credits,
      };
    } else {
      subject = {
        _id: new mongoose.Types.ObjectId('650000000000000000000001'),
        name: 'Computer Science & Engineering',
        code: 'CS-GEN',
        description: 'Foundational university curriculum, algorithms, and systems engineering.',
      };
    }
  }

  const chunks: any[] = [];
  let contextText = '';
  const resourceTitles: string[] = [];

  // 4. If direct user scanned text is provided, give it highest priority
  if (scannedDocumentText && scannedDocumentText.trim()) {
    contextText += `=== USER-UPLOADED SCANNED DOCUMENT ===\n${scannedDocumentText.trim()}\n\n`;
  }

  // 5. Query DocumentChunk: prioritize specific resourceId if provided
  try {
    if (resourceId && mongoose.Types.ObjectId.isValid(resourceId)) {
      const resourceChunks = await DocumentChunk.find({ resourceId: new mongoose.Types.ObjectId(resourceId) })
        .limit(16)
        .lean();
      if (resourceChunks.length > 0) {
        chunks.push(...resourceChunks);
        contextText += `=== UPLOADED RESOURCE EXCERPTS ("${targetResource?.title || 'Selected Resource'}") ===\n` +
          resourceChunks
            .map((c, i) => `[Unit / Section: ${c.sectionTitle || `Section ${i + 1}`} (Page ${c.pageNumber})]\n${c.textContent}`)
            .join('\n\n') + '\n\n';
      }
    }

    // Also gather general chunks for the subject
    if (chunks.length < 8 && subject._id && mongoose.Types.ObjectId.isValid(subject._id.toString())) {
      const subjectChunks = await DocumentChunk.find({ subjectId: subject._id })
        .limit(12)
        .lean();
      if (subjectChunks.length > 0) {
        chunks.push(...subjectChunks);
        contextText += `=== COURSE DOCUMENT CHUNKS ===\n` +
          subjectChunks
            .map((c, i) => `[Unit / Section: ${c.sectionTitle || `Section ${i + 1}`}]\n${c.textContent}`)
            .join('\n\n') + '\n\n';
      }
    }
  } catch (err) {
    console.warn('[AIController] Error retrieving document chunks from DB:', err);
  }

  // 6. Gather all registered Resources for this subject
  try {
    const resources = await Resource.find({ subjectId: subject._id }).lean();
    if (resources.length > 0) {
      resources.forEach((r) => resourceTitles.push(r.title));
      const resourceMeta = resources
        .map((r) => `Resource: "${r.title}" (${r.resourceType}): ${r.description || 'Core syllabus module.'}`)
        .join('\n');
      contextText += `=== REGISTERED COURSE RESOURCES ===\n${resourceMeta}\n\n`;
    }
  } catch (err) {
    console.warn('[AIController] Error retrieving resources from DB:', err);
  }

  // 7. If DB has 0 or few chunks, seamlessly blend in the rich subject curriculum knowledge base
  const curriculumContext = getCurriculumContext(subject.code, subject.name);
  if (curriculumContext) {
    contextText += `=== OFFICIAL CURRICULUM SYLLABUS & UNITS ===\n${curriculumContext}\n\n`;
  }

  if (!contextText.trim()) {
    contextText = `${subject.name} (${subject.code}): ${subject.description || 'Core university coursework.'}`;
  }

  return { subject, contextText: contextText.trim(), resourceTitles, chunks };
}

// 1. Document-Grounded RAG Study Assistant Query
export const queryStudyAssistant = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const prompt = req.body.prompt || req.body.query;
    const { resourceIds, resourceId, subjectId, scannedDocumentText, documentName, history } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Prompt query is required and cannot be empty',
        },
      });
      return;
    }

    const userId = req.user?._id?.toString() || 'anonymous';

    // 1. Rate Limit Check (Sliding Window: 30 queries / 10 minutes)
    const rateLimit = await cacheService.checkRateLimit(userId, 30, 600);
    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `AI query rate limit reached. Please wait ${rateLimit.resetSeconds} seconds before requesting more queries.`,
          resetSeconds: rateLimit.resetSeconds,
        },
      });
      return;
    }

    // 2. Normalize resourceIds (accept either resourceId or resourceIds)
    const effectiveResourceIds: string[] = [];
    if (Array.isArray(resourceIds) && resourceIds.length > 0) {
      effectiveResourceIds.push(...resourceIds.map(String));
    } else if (resourceId) {
      effectiveResourceIds.push(String(resourceId));
    }

    // 3. Semantic Query Cache Check (skip cache if specific scanned document or multi-turn history provided)
    const cacheKey = cacheService.hashKey('rag', { prompt, effectiveResourceIds, subjectId });
    if (!scannedDocumentText && (!history || history.length === 0)) {
      const cachedResponse = await cacheService.get<any>(cacheKey);
      if (cachedResponse) {
        res.json({
          success: true,
          data: {
            ...cachedResponse,
            cached: true,
            remainingQuota: rateLimit.remaining,
          },
        });
        return;
      }
    }

    // 4. Gather rich context and candidate chunks
    const primaryResourceId = effectiveResourceIds[0];
    const { subject, contextText, chunks: gatheredChunks } = await gatherSubjectContext(
      subjectId,
      primaryResourceId,
      scannedDocumentText
    );

    // 5. Generate Query Vector Embedding
    const queryEmbedding = await geminiService.generateEmbedding(prompt);

    // 6. Retrieve candidate chunks from MongoDB with cosine similarity
    const chunkFilter: any = {};
    if (effectiveResourceIds.length > 0) {
      const validIds = effectiveResourceIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      if (validIds.length > 0) {
        chunkFilter.resourceId = { $in: validIds };
      }
    } else if (subject._id && mongoose.Types.ObjectId.isValid(subject._id.toString())) {
      chunkFilter.subjectId = subject._id;
    }

    let candidateChunks: any[] = [];
    try {
      if (Object.keys(chunkFilter).length > 0) {
        candidateChunks = await DocumentChunk.find(chunkFilter)
          .populate('resourceId', 'title')
          .lean();
      }
    } catch (err) {
      console.warn('[AIController] Error searching candidate chunks:', err);
    }

    // 7. Rank chunks by Cosine Similarity
    let topChunks: any[] = [];

    if (candidateChunks.length > 0) {
      const scoredChunks = candidateChunks.map((chunk) => {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        return {
          resourceId: (chunk.resourceId as any)?._id?.toString() || chunk.resourceId.toString(),
          docTitle: (chunk.resourceId as any)?.title || 'Course Material',
          pageNumber: chunk.pageNumber,
          sectionTitle: chunk.sectionTitle,
          textContent: chunk.textContent,
          similarity,
        };
      });

      scoredChunks.sort((a, b) => b.similarity - a.similarity);
      topChunks = scoredChunks.slice(0, 4);
    }

    // If no vector chunks exist in DB, synthesize chunks from curriculum knowledge base
    if (topChunks.length === 0) {
      const curriculum = getCurriculumBySubject(subject.code, subject.name);
      if (curriculum) {
        topChunks = curriculum.units.map((unit) => ({
          resourceId: `${curriculum.code}-unit-${unit.unitNumber}`,
          docTitle: `${curriculum.name} Syllabus`,
          pageNumber: unit.unitNumber,
          sectionTitle: unit.unit,
          textContent: `${unit.title}: ${unit.topics.join(', ')}. Key definitions: ${unit.definitions.map((d) => `${d.term} - ${d.definition}`).join('; ')}`,
          similarity: 1.0,
        }));
      } else {
        topChunks = [
          {
            resourceId: subject._id ? subject._id.toString() : 'curr-1',
            docTitle: `${subject.name} Curriculum`,
            pageNumber: 1,
            sectionTitle: 'Core Syllabus Guidelines',
            textContent: contextText.slice(0, 500),
            similarity: 1.0,
          },
        ];
      }
    }

    // 8. Formulate Grounded Answer via Gemini Service (with multi-turn history & dynamic context synthesis)
    const ragResult = await geminiService.generateGroundedAnswer(
      prompt,
      topChunks,
      scannedDocumentText,
      documentName,
      subject.name,
      subject.code,
      Array.isArray(history) ? history : undefined
    );

    const finalPayload = {
      answer: ragResult.answer,
      citations: ragResult.citedChunks.map((c) => ({
        docId: c.resourceId,
        title: c.docTitle,
        pageNumber: c.pageNumber,
        section: c.sectionTitle,
        excerpt: c.excerpt,
      })),
      model: ragResult.model,
      cached: false,
      remainingQuota: rateLimit.remaining,
    };

    // 9. Store in Cache with 1-hour TTL (if not a temporary scan)
    if (!scannedDocumentText) {
      await cacheService.set(cacheKey, finalPayload, 3600);
    }

    res.json({
      success: true,
      data: finalPayload,
    });
  } catch (err: any) {
    console.error('[AIController] Error in queryStudyAssistant:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: err.message || 'AI generation service is currently unavailable.',
        details: err.stack,
      },
    });
  }
};

// 2. Structured Revision Notes & Contextual Summary Generator
export const generateSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawTargetId = req.body.subjectId || req.body.resourceId;
    const resourceId = req.body.resourceId;

    if (!rawTargetId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'subjectId or resourceId is required',
        },
      });
      return;
    }

    const { subject, contextText, resourceTitles } = await gatherSubjectContext(
      rawTargetId,
      resourceId
    );

    // Dynamic generation via Gemini Service (with dynamic context synthesis)
    const summary = await geminiService.generateSummary(
      subject.name,
      subject.code,
      contextText,
      resourceTitles
    );

    res.json({
      success: true,
      data: {
        subjectId: subject._id,
        subjectName: subject.name,
        subjectCode: subject.code,
        title: summary.title,
        keyTakeaways: summary.keyTakeaways,
        unitBreakdown: summary.unitBreakdown,
        examPrepTips: summary.examPrepTips,
        structuredNotes: summary.structuredNotes,
        model: summary.model,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[AIController] Error in generateSummary:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: err.message || 'AI generation service is currently unavailable.',
        details: err.stack,
      },
    });
  }
};

// 3. AI Practice & Quiz Generator derived from course context
export const generateQuiz = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const rawTargetId = req.body.subjectId || req.body.resourceId;
    const resourceId = req.body.resourceId;
    const difficulty = req.body.difficulty || 'medium';
    const questionCount = Number(req.body.questionCount) || 4;

    if (!rawTargetId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'subjectId or resourceId is required',
        },
      });
      return;
    }

    const { subject, contextText } = await gatherSubjectContext(
      rawTargetId,
      resourceId
    );

    // Dynamic quiz generation via Gemini Service
    const quiz = await geminiService.generateQuiz(
      subject.name,
      subject.code,
      contextText,
      difficulty,
      questionCount
    );

    res.json({
      success: true,
      data: {
        subjectId: subject._id,
        subjectName: quiz.subjectName,
        subjectCode: quiz.subjectCode,
        difficulty: quiz.difficulty,
        questions: quiz.questions,
        model: quiz.model,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('[AIController] Error in generateQuiz:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: err.message || 'AI generation service is currently unavailable.',
        details: err.stack,
      },
    });
  }
};

// 4. AI Flashcard Deck Generator & Spaced Recall
export const getOrCreateFlashcardDeck = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const subjectId = String(req.params.subjectId || '');
    const { regenerate } = req.query;

    const { subject, contextText } = await gatherSubjectContext(subjectId);

    const rawUserId = req.user?._id;
    const userId = (rawUserId && mongoose.Types.ObjectId.isValid(rawUserId.toString()))
      ? (typeof rawUserId === 'string' ? new mongoose.Types.ObjectId(rawUserId) : rawUserId)
      : new mongoose.Types.ObjectId('650000000000000000000001');

    // Check if deck already exists for this subject
    let deck: any = null;
    try {
      deck = await FlashcardDeck.findOne({ subjectId: subject._id, ownerId: userId });
    } catch (err) {
      console.warn('[AIController] MongoDB findOne deck warning (offline/disconnected):', err);
    }

    const shouldRegenerate = regenerate === 'true' || !deck;

    if (shouldRegenerate) {
      // Generate rich contextual flashcards from course materials using Gemini Service
      const generatedCards = await geminiService.generateFlashcards(subject.name, subject.code, contextText, 6);

      try {
        if (!deck) {
          deck = await FlashcardDeck.create({
            ownerId: userId,
            subjectId: subject._id,
            title: `${subject.code} — Core Flashcards`,
            description: `Spaced repetition flashcards for ${subject.name}`,
            cardCount: generatedCards.length,
            visibility: 'public',
          });
        } else {
          // Clear old cards when regenerating
          await Flashcard.deleteMany({ deckId: deck._id });
          deck.cardCount = generatedCards.length;
          deck.updatedAt = new Date();
          await deck.save();
        }

        for (const card of generatedCards) {
          await Flashcard.create({
            deckId: deck._id,
            front: card.front,
            back: card.back,
            sourceRef: card.sourceRef,
            interval: 1,
            repetition: 0,
            easeFactor: 2.5,
            dueDate: new Date(),
          });
        }
      } catch (dbErr) {
        console.warn('[AIController] Flashcard DB persist warning, returning in-memory deck:', dbErr);
        // If DB persist fails (e.g. offline mongo), create synthetic in-memory deck & cards
        const syntheticDeckId = deck?._id || new mongoose.Types.ObjectId('650000000000000000000002');
        const syntheticCards = generatedCards.map((c, i) => ({
          _id: new mongoose.Types.ObjectId(`65000000000000000000001${i}`),
          deckId: syntheticDeckId,
          front: c.front,
          back: c.back,
          sourceRef: c.sourceRef,
          interval: 1,
          repetition: 0,
          easeFactor: 2.5,
          dueDate: new Date(),
        }));

        res.json({
          success: true,
          data: {
            deck: {
              _id: syntheticDeckId,
              ownerId: userId,
              subjectId: subject._id,
              title: `${subject.code} — Core Flashcards`,
              description: `Spaced repetition flashcards for ${subject.name}`,
              cardCount: syntheticCards.length,
              visibility: 'public',
            },
            cards: syntheticCards,
            subject: {
              _id: subject._id,
              name: subject.name,
              code: subject.code,
            },
          },
        });
        return;
      }
    }

    let cards: any[] = [];
    try {
      cards = await Flashcard.find({ deckId: deck._id }).lean();
    } catch (err) {
      console.warn('[AIController] Error finding flashcards from DB:', err);
    }

    res.json({
      success: true,
      data: {
        deck,
        cards,
        subject: {
          _id: subject._id,
          name: subject.name,
          code: subject.code,
        },
      },
    });
  } catch (err: any) {
    console.error('[AIController] Error in getOrCreateFlashcardDeck:', err);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_SERVICE_UNAVAILABLE',
        message: err.message || 'AI generation service is currently unavailable.',
        details: err.stack,
      },
    });
  }
};

// 5. Spaced Repetition Review Assessment (SuperMemo SM-2 Algorithm)
export const reviewFlashcard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { cardId } = req.params;
    const { quality } = req.body; // 0 to 5 score (SuperMemo SM-2)

    const card = await Flashcard.findById(cardId);
    if (!card) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Flashcard not found',
        },
      });
      return;
    }

    const q = Math.max(0, Math.min(5, Number(quality) || 3));

    // Calculate new SM-2 Ease Factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    let newEF = card.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (newEF < 1.3) newEF = 1.3;

    let newInterval: number;
    let newRepetition = card.repetition;

    if (q >= 3) {
      if (newRepetition === 0) {
        newInterval = 1;
      } else if (newRepetition === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * newEF);
      }
      newRepetition += 1;
    } else {
      newRepetition = 0;
      newInterval = 1;
    }

    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + newInterval);

    card.easeFactor = Number(newEF.toFixed(2));
    card.interval = newInterval;
    card.repetition = newRepetition;
    card.dueDate = nextDueDate;
    await card.save();

    res.json({
      success: true,
      data: {
        cardId: card._id,
        intervalDays: newInterval,
        nextDueDate,
        repetition: newRepetition,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'Internal server error processing flashcard review',
      },
    });
  }
};
