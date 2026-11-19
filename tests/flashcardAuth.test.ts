import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { reviewFlashcard } from '../server/src/controllers/aiController';
import { Flashcard, FlashcardDeck } from '../server/src/models/Flashcard';

async function runTests() {
  console.log('Running Flashcard Review Authorization Test Suite...');

  const ownerId = '650000000000000000000010';
  const otherUserId = '650000000000000000000020';
  const adminId = '650000000000000000000099';

  const mockDeck: any = {
    _id: '650000000000000000000200',
    ownerId,
    title: 'CS-201 Core Deck',
  };

  const mockCard: any = {
    _id: '650000000000000000000300',
    deckId: mockDeck._id,
    front: 'What is the time complexity of QuickSelect average case?',
    back: 'O(N) on average, O(N^2) in worst-case.',
    easeFactor: 2.5,
    interval: 1,
    repetition: 0,
    dueDate: new Date(),
    save: async () => mockCard,
  };

  // Mock Flashcard.findById and FlashcardDeck.findById
  (Flashcard as any).findById = (id: string) => {
    if (String(id) === String(mockCard._id)) return mockCard;
    return null;
  };
  (FlashcardDeck as any).findById = (id: string) => {
    if (String(id) === String(mockDeck._id)) return mockDeck;
    return null;
  };

  try {
    // Test 1: reviewFlashcard rejects unauthenticated request with 401
    {
      const req: any = {
        params: { cardId: mockCard._id },
        body: { quality: 4 },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await reviewFlashcard(req, res);
      assert.strictEqual(statusCode, 401, 'Unauthenticated review must return 401');
      assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED');
      console.log('[PASS] Test 1: Unauthenticated flashcard review rejected with 401.');
    }

    // Test 2: reviewFlashcard returns 404 for missing card
    {
      const req: any = {
        user: { _id: ownerId, role: 'student' },
        params: { cardId: '650000000000000000000999' },
        body: { quality: 4 },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await reviewFlashcard(req, res);
      assert.strictEqual(statusCode, 404, 'Non-existent card must return 404');
      assert.strictEqual(jsonPayload.error.code, 'NOT_FOUND');
      console.log('[PASS] Test 2: Non-existent card returned 404.');
    }

    // Test 3: reviewFlashcard rejects unauthorized student with 403 Forbidden
    {
      const req: any = {
        user: { _id: otherUserId, role: 'student' },
        params: { cardId: mockCard._id },
        body: { quality: 4 },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await reviewFlashcard(req, res);
      assert.strictEqual(statusCode, 403, 'Reviewing someone else card must return 403 Forbidden');
      assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
      console.log('[PASS] Test 3: Unauthorized student review rejected with 403 Forbidden.');
    }

    // Test 4: reviewFlashcard allows deck owner to review with 200 OK
    {
      const req: any = {
        user: { _id: ownerId, role: 'student' },
        params: { cardId: mockCard._id },
        body: { quality: 4 },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await reviewFlashcard(req, res);
      assert.strictEqual(statusCode, 200, 'Owner review must return 200');
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(jsonPayload.data.cardId, mockCard._id);
      assert.strictEqual(jsonPayload.data.repetition, 1);
      console.log('[PASS] Test 4: Deck owner successfully submitted review with 200 OK.');
    }

    // Test 5: reviewFlashcard allows admin to review with 200 OK
    {
      const req: any = {
        user: { _id: adminId, role: 'admin' },
        params: { cardId: mockCard._id },
        body: { quality: 5 },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await reviewFlashcard(req, res);
      assert.strictEqual(statusCode, 200, 'Admin review must return 200');
      assert.strictEqual(jsonPayload.success, true);
      console.log('[PASS] Test 5: Admin review successfully authorized.');
    }

    console.log('\nAll 5 Flashcard Review Authorization tests PASSED successfully!\n');
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  }
}

runTests();
