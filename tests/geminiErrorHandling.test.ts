import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  GeminiApiError,
  parseGeminiError,
  GeminiService,
} from '../server/src/services/geminiService';

async function runTests() {
  console.log('Running Gemini API Error Normalization Test Suite (Task 26)...');

  // Test 1: parseGeminiError parses HTTP 429 Rate Limits
  {
    const err429 = parseGeminiError(429);
    assert.strictEqual(err429.statusCode, 429);
    assert.strictEqual(err429.errorCode, 'RATE_LIMIT_EXCEEDED');
    assert.strictEqual(err429.isRateLimit, true);
    assert.strictEqual(err429.isQuotaExceeded, true);
    assert.ok(err429.message.includes('rate limit exceeded'));
    console.log('[PASS] Test 1: HTTP 429 rate limits normalized into friendly error structure.');
  }

  // Test 2: parseGeminiError parses HTTP 403 Quota Exhaustion
  {
    const err403 = parseGeminiError(403);
    assert.strictEqual(err403.statusCode, 403);
    assert.strictEqual(err403.errorCode, 'QUOTA_EXHAUSTED');
    assert.strictEqual(err403.isRateLimit, false);
    assert.strictEqual(err403.isQuotaExceeded, true);
    assert.ok(err403.message.includes('quota exhausted'));
    console.log('[PASS] Test 2: HTTP 403 quota exhaustion parsed with quota flag.');
  }

  // Test 3: parseGeminiError parses HTTP 503 Service Unavailable
  {
    const err503 = parseGeminiError(503);
    assert.strictEqual(err503.statusCode, 503);
    assert.strictEqual(err503.errorCode, 'UPSTREAM_SERVICE_UNAVAILABLE');
    assert.strictEqual(err503.isRateLimit, false);
    console.log('[PASS] Test 3: HTTP 503 service outages handled as upstream availability notices.');
  }

  // Test 4: GeminiService seamlessly falls back to curriculum synthesis on failure
  {
    const service = new GeminiService();
    // In this offline/test environment without active API key or on network drop,
    // verify all 4 AI entry points return full grounded results via dynamic synthesis
    const groundedAnswer = await service.generateGroundedAnswer('What are B-Trees?', [], undefined, undefined, 'CS-201');
    assert.ok(groundedAnswer.answer.length > 50, 'Answer must be synthesized');
    assert.ok(groundedAnswer.model.includes('dynamic context synthesis'));

    const summary = await service.generateSummary('CS-201');
    assert.ok(summary.unitBreakdown.length > 0, 'Summary units must be synthesized');

    const quiz = await service.generateQuiz('CS-201');
    assert.ok(quiz.questions.length > 0, 'Quiz questions must be synthesized');

    const flashcards = await service.generateFlashcards('CS-201');
    assert.ok(flashcards.length > 0, 'Flashcards must be synthesized');

    console.log('[PASS] Test 4: All 4 AI study features fall back reliably to curriculum synthesis.');
  }

  console.log('\nAll 4 Gemini API Error Normalization tests PASSED successfully!\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
