import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { getComments } from '../server/src/controllers/discussionController';
import { Comment } from '../server/src/models/Discussion';

async function runTests() {
  console.log('Running Discussion Comments Loading Test Suite...');

  const discussionId = '650000000000000000000100';
  const emptyDiscussionId = '650000000000000000000199';

  const mockComments: any[] = [
    {
      _id: '650000000000000000000201',
      discussionId,
      authorId: { _id: 'u1', name: 'Aarav Mehta', role: 'student', reputationPoints: 45 },
      body: 'Standard reply from a peer student.',
      isAcceptedAnswer: false,
      upvotes: 4,
      createdAt: new Date(Date.now() - 3600000),
    },
    {
      _id: '650000000000000000000202',
      discussionId,
      authorId: { _id: 'u2', name: 'Prof. Aryan Sharma', role: 'mentor', reputationPoints: 240 },
      body: 'Verified solution explaining the Dijkstra invariants.',
      isAcceptedAnswer: true,
      upvotes: 18,
      createdAt: new Date(Date.now() - 1800000),
    },
  ];

  // Mock Comment.find
  const originalFind = Comment.find;
  (Comment as any).find = (filter: any) => {
    return {
      populate: (_field: string, _projection: string) => ({
        sort: (sortCriteria: any) => ({
          lean: async () => {
            if (String(filter.discussionId) === emptyDiscussionId) {
              return [];
            }
            if (String(filter.discussionId) === discussionId) {
              // Emulate MongoDB sort({ isAcceptedAnswer: -1, createdAt: 1 })
              const sorted = [...mockComments].sort((a, b) => {
                if (sortCriteria.isAcceptedAnswer) {
                  if (a.isAcceptedAnswer !== b.isAcceptedAnswer) {
                    return a.isAcceptedAnswer ? -1 : 1;
                  }
                }
                return a.createdAt.getTime() - b.createdAt.getTime();
              });
              return sorted;
            }
            return [];
          },
        }),
      }),
    };
  };

  try {
    // Test 1: getComments returns comments for discussion
    {
      const req: any = { params: { id: discussionId } };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getComments(req, res);
      assert.strictEqual(statusCode, 200);
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(jsonPayload.data.length, 2);
      console.log('[PASS] Test 1: getComments successfully returned discussion replies.');
    }

    // Test 2: Accepted answers are sorted first
    {
      const req: any = { params: { id: discussionId } };
      let jsonPayload: any = null;
      const res: any = {
        status: () => res,
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getComments(req, res);
      assert.strictEqual(jsonPayload.data[0].isAcceptedAnswer, true, 'Accepted answer must be at index 0');
      assert.strictEqual(jsonPayload.data[0].authorId.name, 'Prof. Aryan Sharma');
      assert.strictEqual(jsonPayload.data[1].isAcceptedAnswer, false);
      console.log('[PASS] Test 2: Accepted solutions prioritized at the top of the comment list.');
    }

    // Test 3: Empty discussion returns empty array
    {
      const req: any = { params: { id: emptyDiscussionId } };
      let jsonPayload: any = null;
      const res: any = {
        status: () => res,
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getComments(req, res);
      assert.strictEqual(jsonPayload.success, true);
      assert.deepStrictEqual(jsonPayload.data, []);
      console.log('[PASS] Test 3: Empty discussion safely returned empty list.');
    }

    console.log('\nAll 3 Discussion Comments Loading tests PASSED successfully!\n');
  } finally {
    (Comment as any).find = originalFind;
  }
}

runTests();
