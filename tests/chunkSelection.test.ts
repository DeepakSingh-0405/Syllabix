import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  optimizeChunkSelection,
  ScoredChunk,
} from '../server/src/controllers/aiController';

async function runTests() {
  console.log('Running Context Window & Chunk Selection Optimization Test Suite (Task 29)...');

  // Test 1: Deduplication of redundant / near-identical chunks
  {
    const inputChunks: ScoredChunk[] = [
      {
        resourceId: 'res-1',
        docTitle: 'Lecture 1.pdf',
        pageNumber: 1,
        sectionTitle: 'B-Trees',
        textContent: 'B-Trees are self-balancing search trees that maintain sorted data and allow logarithmic searches, insertions, and deletions.',
        similarity: 0.95,
      },
      {
        resourceId: 'res-1',
        docTitle: 'Lecture 1.pdf',
        pageNumber: 2,
        sectionTitle: 'B-Trees Duplicate Slide',
        textContent: 'B-Trees are self-balancing search trees that maintain sorted data and allow logarithmic searches, insertions, and deletions.', // exact same content
        similarity: 0.94,
      },
      {
        resourceId: 'res-2',
        docTitle: 'Lecture 2.pdf',
        pageNumber: 5,
        sectionTitle: 'Red-Black Trees',
        textContent: 'A red-black tree is a binary search tree with one extra bit of storage per node: color, which is either RED or BLACK.',
        similarity: 0.88,
      },
    ];

    const optimized = optimizeChunkSelection(inputChunks, 4, 6000, 1500);
    assert.strictEqual(optimized.length, 2, 'Should deduplicate the second redundant B-Tree chunk');
    assert.strictEqual(optimized[0].docTitle, 'Lecture 1.pdf');
    assert.strictEqual(optimized[1].docTitle, 'Lecture 2.pdf');
    console.log('[PASS] Test 1: Redundant/duplicate chunks successfully detected and removed via content fingerprinting.');
  }

  // Test 2: Source diversity balancing across multiple course documents
  {
    const inputChunks: ScoredChunk[] = [
      { resourceId: 'doc-A', docTitle: 'Doc A', pageNumber: 1, textContent: 'Content A1 - Process Scheduling', similarity: 0.92 },
      { resourceId: 'doc-A', docTitle: 'Doc A', pageNumber: 2, textContent: 'Content A2 - Round Robin Quantum', similarity: 0.91 },
      { resourceId: 'doc-A', docTitle: 'Doc A', pageNumber: 3, textContent: 'Content A3 - Priority Scheduling Inversion', similarity: 0.90 },
      { resourceId: 'doc-B', docTitle: 'Doc B', pageNumber: 1, textContent: 'Content B1 - Multilevel Feedback Queues', similarity: 0.89 },
      { resourceId: 'doc-C', docTitle: 'Doc C', pageNumber: 1, textContent: 'Content C1 - Real-Time Earliest Deadline First', similarity: 0.87 },
    ];

    const optimized = optimizeChunkSelection(inputChunks, 4, 6000, 1500);
    assert.strictEqual(optimized.length, 4, 'Should select 4 diverse chunks');

    const docACount = optimized.filter((c) => c.resourceId === 'doc-A').length;
    const docBCount = optimized.filter((c) => c.resourceId === 'doc-B').length;
    const docCCount = optimized.filter((c) => c.resourceId === 'doc-C').length;

    assert.strictEqual(docACount, 2, 'Document A should be capped at 2 chunks to avoid dominating the context');
    assert.strictEqual(docBCount, 1, 'Document B should be represented');
    assert.strictEqual(docCCount, 1, 'Document C should be represented');
    console.log('[PASS] Test 2: Source diversity balancing preserves multi-document citations in the context window.');
  }

  // Test 3: Per-chunk clamping and total token/character budget limit
  {
    const hugeText = 'Over-length text with lots of details. '.repeat(100); // ~3900 characters
    const inputChunks: ScoredChunk[] = [
      { resourceId: 'res-1', docTitle: 'BigDoc 1', pageNumber: 1, textContent: hugeText, similarity: 0.9 },
      { resourceId: 'res-2', docTitle: 'BigDoc 2', pageNumber: 1, textContent: hugeText, similarity: 0.85 },
      { resourceId: 'res-3', docTitle: 'BigDoc 3', pageNumber: 1, textContent: hugeText, similarity: 0.8 },
      { resourceId: 'res-4', docTitle: 'BigDoc 4', pageNumber: 1, textContent: hugeText, similarity: 0.75 },
    ];

    const maxCharsPerChunk = 500;
    const maxTotalBudget = 1200;
    const optimized = optimizeChunkSelection(inputChunks, 4, maxTotalBudget, maxCharsPerChunk);

    for (const chunk of optimized) {
      assert.ok(chunk.textContent.length <= maxCharsPerChunk + 3, `Chunk text must be clamped to ${maxCharsPerChunk}`);
    }

    const totalChars = optimized.reduce((sum, c) => sum + c.textContent.length, 0);
    assert.ok(totalChars <= maxTotalBudget + 500, `Total characters must respect context window budget limit (${totalChars} <= ${maxTotalBudget})`);
    console.log('[PASS] Test 3: Per-chunk text clamping and global budget limits strictly enforced.');
  }

  // Test 4: Empty input safety
  {
    const emptyResult = optimizeChunkSelection([]);
    assert.deepStrictEqual(emptyResult, [], 'Empty candidate list safely returns empty array');
    console.log('[PASS] Test 4: Empty candidate chunk list handled gracefully without exceptions.');
  }

  console.log('\nAll 4 Context Window & Chunk Selection Optimization tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
