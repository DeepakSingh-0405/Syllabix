import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  GEMINI_CONFIG,
  getActiveTextModel,
  getActiveEmbeddingModel,
  GeminiService,
} from '../server/src/services/geminiService';

async function runTests() {
  console.log('Running Model Configuration Test Suite (Task 25)...');

  // Test 1: GEMINI_CONFIG has canonical production model identifiers
  {
    assert.strictEqual(GEMINI_CONFIG.DEFAULT_MODEL, 'gemini-1.5-flash');
    assert.strictEqual(GEMINI_CONFIG.EMBEDDING_MODEL, 'text-embedding-004');
    console.log('[PASS] Test 1: Canonical production models defined (gemini-1.5-flash, text-embedding-004).');
  }

  // Test 2: getActiveTextModel returns default model or configured override
  {
    const defaultModel = getActiveTextModel();
    assert.strictEqual(defaultModel, 'gemini-1.5-flash');

    // Test environment override
    process.env.GEMINI_MODEL = 'gemini-2.0-flash';
    assert.strictEqual(getActiveTextModel(), 'gemini-2.0-flash');

    // Reset
    delete process.env.GEMINI_MODEL;
    assert.strictEqual(getActiveTextModel(), 'gemini-1.5-flash');
    console.log('[PASS] Test 2: getActiveTextModel defaults to gemini-1.5-flash and respects runtime overrides.');
  }

  // Test 3: getActiveEmbeddingModel returns default or override
  {
    const defaultEmbedding = getActiveEmbeddingModel();
    assert.strictEqual(defaultEmbedding, 'text-embedding-004');

    process.env.GEMINI_EMBEDDING_MODEL = 'text-embedding-005';
    assert.strictEqual(getActiveEmbeddingModel(), 'text-embedding-005');

    delete process.env.GEMINI_EMBEDDING_MODEL;
    assert.strictEqual(getActiveEmbeddingModel(), 'text-embedding-004');
    console.log('[PASS] Test 3: getActiveEmbeddingModel defaults to text-embedding-004 and respects overrides.');
  }

  // Test 4: GeminiService synthetic outputs reference active configured model
  {
    const service = new GeminiService();
    const result = await service.generateGroundedAnswer('Explain binary search', [], undefined, undefined, 'CS-201');
    assert.ok(result.model.includes('gemini-1.5-flash'), `Model must reference gemini-1.5-flash, got: ${result.model}`);
    assert.ok(!result.model.includes('3.8-flash'), 'Model must NOT reference obsolete 3.8-flash');

    const summary = await service.generateSummary('CS-201');
    assert.ok(summary.model.includes('gemini-1.5-flash'), `Summary model must reference gemini-1.5-flash: ${summary.model}`);

    const quiz = await service.generateQuiz('CS-201');
    assert.ok(quiz.model.includes('gemini-1.5-flash'), `Quiz model must reference gemini-1.5-flash: ${quiz.model}`);
    console.log('[PASS] Test 4: GeminiService output models consistently reflect gemini-1.5-flash.');
  }

  console.log('\nAll 4 Model Configuration tests PASSED successfully!\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
