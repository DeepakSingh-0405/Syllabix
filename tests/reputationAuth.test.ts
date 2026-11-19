import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { acceptAnswer } from '../server/src/controllers/discussionController';
import { Discussion, Comment } from '../server/src/models/Discussion';
import { User } from '../server/src/models/User';
import { Notification } from '../server/src/models/Notification';

async function runTests() {
  console.log('Running Reputation & Accept Answer Authorization Test Suite...');

  const authorId = '650000000000000000000010';
  const peerId = '650000000000000000000020';
  const attackerId = '650000000000000000000030';

  const mockDiscussion: any = {
    _id: '650000000000000000000100',
    authorId,
    title: 'How does Dijkstra handle non-negative weights?',
    status: 'open',
    acceptedAnswerId: undefined,
    save: async () => mockDiscussion,
  };

  const mockPeerComment: any = {
    _id: '650000000000000000000200',
    discussionId: mockDiscussion._id,
    authorId: peerId,
    body: 'Dijkstra requires non-negative edges because it greedily finalizes the minimum distance vertex.',
    isAcceptedAnswer: false,
    save: async () => mockPeerComment,
  };

  const mockSelfComment: any = {
    _id: '650000000000000000000201',
    discussionId: mockDiscussion._id,
    authorId, // same as question author
    body: 'I solved it myself.',
    isAcceptedAnswer: false,
    save: async () => mockSelfComment,
  };

  const mockForeignComment: any = {
    _id: '650000000000000000000202',
    discussionId: '650000000000000000000999', // foreign discussion
    authorId: peerId,
    body: 'Unrelated answer.',
    isAcceptedAnswer: false,
    save: async () => mockForeignComment,
  };

  // Mock Mongoose models
  (Discussion as any).findById = (id: string) => {
    if (String(id) === String(mockDiscussion._id)) return mockDiscussion;
    return null;
  };

  (Comment as any).findById = (id: string) => {
    if (String(id) === String(mockPeerComment._id)) return mockPeerComment;
    if (String(id) === String(mockSelfComment._id)) return mockSelfComment;
    if (String(id) === String(mockForeignComment._id)) return mockForeignComment;
    return null;
  };

  let reputationAwarded = 0;
  let targetAwardedUserId = '';
  (User as any).findByIdAndUpdate = async (userId: string, update: any) => {
    targetAwardedUserId = String(userId);
    if (update.$inc?.reputationPoints) {
      reputationAwarded += update.$inc.reputationPoints;
    }
    return { _id: userId };
  };

  let notificationCreated = false;
  (Notification as any).create = async () => {
    notificationCreated = true;
    return {};
  };

  try {
    // Test 1: acceptAnswer rejects unauthenticated request with 401
    {
      const req: any = {
        params: { id: mockDiscussion._id },
        body: { commentId: mockPeerComment._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await acceptAnswer(req, res);
      assert.strictEqual(statusCode, 401, 'Must reject unauthenticated with 401');
      assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED');
      console.log('[PASS] Test 1: Unauthenticated acceptAnswer rejected with 401.');
    }

    // Test 2: acceptAnswer rejects non-author with 403 Forbidden
    {
      const req: any = {
        user: { _id: attackerId },
        params: { id: mockDiscussion._id },
        body: { commentId: mockPeerComment._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await acceptAnswer(req, res);
      assert.strictEqual(statusCode, 403, 'Must reject non-author with 403 Forbidden');
      assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
      console.log('[PASS] Test 2: Non-author rejected with 403 Forbidden.');
    }

    // Test 3: acceptAnswer rejects self-acceptance to farm reputation
    {
      const req: any = {
        user: { _id: authorId },
        params: { id: mockDiscussion._id },
        body: { commentId: mockSelfComment._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await acceptAnswer(req, res);
      assert.strictEqual(statusCode, 400, 'Must reject self-acceptance with 400 Bad Request');
      assert.strictEqual(jsonPayload.error.code, 'SELF_ACCEPT_PREVENTED');
      console.log('[PASS] Test 3: Self-acceptance rejected with 400 (anti-reputation farming).');
    }

    // Test 4: acceptAnswer rejects comment belonging to another discussion
    {
      const req: any = {
        user: { _id: authorId },
        params: { id: mockDiscussion._id },
        body: { commentId: mockForeignComment._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await acceptAnswer(req, res);
      assert.strictEqual(statusCode, 400, 'Must reject foreign comment with 400');
      assert.strictEqual(jsonPayload.error.code, 'INVALID_COMMENT');
      console.log('[PASS] Test 4: Foreign discussion comment rejected with 400.');
    }

    // Test 5: acceptAnswer succeeds for genuine peer answer
    {
      const req: any = {
        user: { _id: authorId },
        params: { id: mockDiscussion._id },
        body: { commentId: mockPeerComment._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await acceptAnswer(req, res);
      assert.strictEqual(statusCode, 200, 'Must succeed with 200 OK');
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(mockPeerComment.isAcceptedAnswer, true);
      assert.strictEqual(mockDiscussion.status, 'resolved');
      assert.strictEqual(String(mockDiscussion.acceptedAnswerId), String(mockPeerComment._id));
      assert.strictEqual(reputationAwarded, 15, 'Peer must be awarded 15 points');
      assert.strictEqual(targetAwardedUserId, peerId);
      assert.strictEqual(notificationCreated, true, 'Notification must be triggered');
      console.log('[PASS] Test 5: Peer answer accepted successfully with +15 reputation awarded.');
    }

    // Test 6: acceptAnswer prevents accepting multiple/duplicate answers on resolved question
    {
      const req: any = {
        user: { _id: authorId },
        params: { id: mockDiscussion._id },
        body: { commentId: mockPeerComment._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await acceptAnswer(req, res);
      assert.strictEqual(statusCode, 400, 'Must reject duplicate acceptance on already resolved discussion');
      assert.strictEqual(jsonPayload.error.code, 'ALREADY_RESOLVED');
      assert.strictEqual(reputationAwarded, 15, 'Reputation must NOT be awarded a second time');
      console.log('[PASS] Test 6: Re-acceptance blocked, preventing duplicate reputation inflation.');
    }

    console.log('\nAll 6 Reputation Manipulation Prevention tests PASSED successfully!\n');
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  }
}

runTests();
