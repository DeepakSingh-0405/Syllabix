import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

// Force offline mode to test deterministic fallback paths without network delays
process.env.GEMINI_API_KEY = '';

import { GeminiService } from '../server/src/services/geminiService';

async function runTests() {
  console.log('Running Deterministic AI Synthesis Fallback Test Suite (Task 28)...');
  const service = new GeminiService();

  // Test 1: Grounded RAG Chatbot Synthesis
  {
    const groundedResult = await service.generateGroundedAnswer(
      'Explain B-Tree search and insertion complexity',
      [
        {
          resourceId: 'res-ds-1',
          docTitle: 'Advanced Trees.pdf',
          pageNumber: 14,
          sectionTitle: 'B-Trees',
          textContent: 'A B-Tree of order m is an m-way search tree. Searching takes O(log n) disk accesses.',
        },
      ],
      undefined,
      undefined,
      'Data Structures & Algorithms',
      'CS-201'
    );

    assert.ok(groundedResult.answer && groundedResult.answer.length > 100, 'Answer must be comprehensive');
    assert.ok(groundedResult.answer.includes('B-Tree') || groundedResult.answer.includes('Complexity') || groundedResult.answer.includes('CS-201'), 'Answer must ground in subject context');
    assert.ok(Array.isArray(groundedResult.citedChunks) && groundedResult.citedChunks.length > 0, 'Citations must be present');
    assert.strictEqual(groundedResult.citedChunks[0].docTitle, 'Advanced Trees.pdf');
    assert.ok(groundedResult.model.includes('dynamic context synthesis') || groundedResult.model.includes('gemini'), 'Model tag should be populated');
    console.log('[PASS] Test 1: Grounded RAG Chatbot synthesis generates comprehensive response with citations.');
  }

  // Test 2: AI Revision Summary Synthesis
  {
    const summary = await service.generateSummary(
      'Operating Systems',
      'CS-202',
      '=== SYLLABUS UNITS & DETAILED TOPICS ===\nUnit 1: Process Management\nUnit 2: Memory Management\nUnit 3: Storage Management'
    );

    assert.ok(summary.title.includes('Operating Systems') || summary.title.includes('CS-202'), 'Title must reflect subject');
    assert.ok(summary.keyTakeaways.length >= 3, 'Must contain at least 3 key takeaways');
    assert.ok(summary.unitBreakdown.length >= 3, 'Must contain at least 3 unit breakdowns');

    const firstUnit = summary.unitBreakdown[0];
    assert.ok(typeof firstUnit.unitNumber === 'number', 'Unit number must be numeric');
    assert.ok(firstUnit.unit, 'Unit string must be present');
    assert.ok(firstUnit.title, 'Title must be present');
    assert.ok(Array.isArray(firstUnit.topics) && firstUnit.topics.length > 0, 'Topics must be non-empty array');
    assert.ok(Array.isArray(firstUnit.coreTopics), 'coreTopics must be array');
    assert.ok(Array.isArray(firstUnit.coreFormulasOrPrinciples), 'coreFormulasOrPrinciples must be array');
    assert.ok(Array.isArray(firstUnit.highYieldConcepts), 'highYieldConcepts must be array');
    assert.ok(summary.examPrepTips.length >= 2, 'Exam prep tips must be populated');
    assert.ok(summary.structuredNotes.length > 50, 'Structured notes markdown must be populated');
    console.log('[PASS] Test 2: AI Revision Summary synthesis produces fully structured syllabus units.');
  }

  // Test 3: AI Practice Quiz Synthesis
  {
    const requestedCount = 4;
    const quiz = await service.generateQuiz(
      'Database Management Systems',
      'CS-203',
      'Relational algebra, SQL, Normalization (1NF, 2NF, 3NF, BCNF), ACID transactions, indexing',
      'medium',
      requestedCount
    );

    assert.strictEqual(quiz.questions.length, requestedCount, `Must return exactly ${requestedCount} questions`);
    assert.strictEqual(quiz.difficulty, 'medium');

    for (const q of quiz.questions) {
      assert.ok(q.id, 'Question must have id');
      assert.strictEqual(q.type, 'mcq');
      assert.ok(q.question && q.question.length > 10, 'Question text must be meaningful');
      assert.strictEqual(q.options.length, 4, 'Must have exactly 4 options');
      assert.ok(q.correctIndex >= 0 && q.correctIndex < 4, 'correctIndex must be between 0 and 3');
      assert.ok(q.explanation && q.explanation.length > 10, 'Explanation must be educational');
    }
    console.log('[PASS] Test 3: AI Practice Quiz synthesis produces exact question count with 4 options and valid explanations.');
  }

  // Test 4: AI Flashcard Generator Synthesis
  {
    const requestedCount = 6;
    // 4a. With curriculum subject
    const curriculumCards = await service.generateFlashcards(
      'Computer Networks',
      'CS-301',
      '',
      requestedCount
    );
    assert.strictEqual(curriculumCards.length, requestedCount, `Curriculum cards must match requested count of ${requestedCount}`);
    for (const card of curriculumCards) {
      assert.ok(card.front && card.front.length > 5, 'Card front must be non-empty');
      assert.ok(card.back && card.back.length > 10, 'Card back must provide explanation');
      assert.ok(card.sourceRef, 'Source reference must be indicated');
    }

    // 4b. With unknown subject and short custom context
    const customCards = await service.generateFlashcards(
      'Quantum Computing Architecture',
      'QC-401',
      'Qubit: Two-state quantum mechanical system. Superposition: Linear combination of states |0> and |1>.',
      requestedCount
    );
    assert.strictEqual(customCards.length, requestedCount, `Custom cards must match requested count of ${requestedCount}`);
    for (const card of customCards) {
      assert.ok(card.front && card.front.length > 5, 'Custom card front must be valid');
      assert.ok(card.back && card.back.length > 5, 'Custom card back must be valid');
      assert.ok(card.sourceRef, 'Custom card sourceRef must be present');
    }
    console.log('[PASS] Test 4: AI Flashcard generator guarantees requested card count across both curriculum and custom subjects.');
  }

  // Test 5: Deterministic Vector Embedding Generation
  {
    const vec1 = await service.generateEmbedding('Relational database normalization 3NF');
    const vec2 = await service.generateEmbedding('Relational database normalization 3NF');

    assert.strictEqual(vec1.length, 768, 'Embedding must be 768 dimensions');
    assert.deepStrictEqual(vec1, vec2, 'Identical text must generate deterministic identical embeddings');

    const l2Norm = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    assert.ok(Math.abs(l2Norm - 1.0) < 0.01, `Embedding vector must be L2-normalized (got ${l2Norm})`);
    console.log('[PASS] Test 5: Deterministic 768-dim embeddings are reproducible and L2-normalized.');
  }

  console.log('\nAll 5 Deterministic AI Synthesis Fallback tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
