import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { getMentorshipMessages, postMentorshipMessage } from '../server/src/controllers/mentorshipController';
import { MentorshipRequest } from '../server/src/models/Mentorship';

async function runTests() {
  console.log('Running Mentorship Authorization Test Suite...');

  const studentId = '650000000000000000000010';
  const mentorId = '650000000000000000000020';
  const attackerId = '650000000000000000000099';

  // Mock in-memory mentorship session
  const mockSession: any = {
    _id: '650000000000000000000100',
    studentId,
    mentorId,
    status: 'accepted',
    messages: [
      { senderId: studentId, senderName: 'Alice', text: 'Hi mentor, can we review Graph algorithms?', createdAt: new Date() },
    ],
    save: async () => mockSession,
  };

  // Mock MentorshipRequest.findById
  const originalFindById = MentorshipRequest.findById;
  (MentorshipRequest as any).findById = (id: string) => {
    if (id === mockSession._id) {
      return {
        select: (_fields: string) => mockSession,
        ...mockSession,
      };
    }
    return null;
  };

  try {
    // Test 1: getMentorshipMessages rejects unauthenticated request with 401
    {
      const req: any = { params: { id: mockSession._id } };
      let statusCode = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getMentorshipMessages(req, res);
      assert.strictEqual(statusCode, 401, 'Must return 401 when unauthenticated');
      assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED');
      console.log('[PASS] Test 1: Unauthenticated read request rejected with 401.');
    }

    // Test 2: getMentorshipMessages rejects non-participant attacker with 403 Forbidden
    {
      const req: any = {
        user: { _id: attackerId, name: 'Attacker' },
        params: { id: mockSession._id },
      };
      let statusCode = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getMentorshipMessages(req, res);
      assert.strictEqual(statusCode, 403, 'Must return 403 Forbidden for non-participant');
      assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
      console.log('[PASS] Test 2: Non-participant reading messages rejected with 403 Forbidden.');
    }

    // Test 3: getMentorshipMessages succeeds for authorized student
    {
      const req: any = {
        user: { _id: studentId, name: 'Alice' },
        params: { id: mockSession._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getMentorshipMessages(req, res);
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(jsonPayload.data.length, 1);
      assert.strictEqual(jsonPayload.data[0].text, 'Hi mentor, can we review Graph algorithms?');
      console.log('[PASS] Test 3: Authorized student can read mentorship messages.');
    }

    // Test 4: postMentorshipMessage rejects non-participant attacker with 403
    {
      const req: any = {
        user: { _id: attackerId, name: 'Attacker' },
        params: { id: mockSession._id },
        body: { text: 'I am injecting an unauthorized message' },
      };
      let statusCode = 0;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await postMentorshipMessage(req, res);
      assert.strictEqual(statusCode, 403, 'Must return 403 Forbidden when attacker posts message');
      assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
      console.log('[PASS] Test 4: Non-participant posting message rejected with 403 Forbidden.');
    }

    // Test 5: postMentorshipMessage succeeds for authorized mentor
    {
      const req: any = {
        user: { _id: mentorId, name: 'Prof. Aryan Sharma' },
        params: { id: mockSession._id },
        body: { text: 'Sure Alice, let us meet tomorrow at 4 PM.' },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await postMentorshipMessage(req, res);
      assert.strictEqual(statusCode, 201);
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(jsonPayload.data.senderId, mentorId);
      assert.strictEqual(jsonPayload.data.text, 'Sure Alice, let us meet tomorrow at 4 PM.');
      console.log('[PASS] Test 5: Authorized mentor can post messages.');
    }

    // Test 6: postMentorshipMessage rejects empty text
    {
      const req: any = {
        user: { _id: studentId, name: 'Alice' },
        params: { id: mockSession._id },
        body: { text: '   ' },
      };
      let statusCode = 0;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: () => res,
      };

      await postMentorshipMessage(req, res);
      assert.strictEqual(statusCode, 400, 'Must reject empty message with 400 Bad Request');
      console.log('[PASS] Test 6: Empty message rejected with 400 Bad Request.');
    }

  } finally {
    MentorshipRequest.findById = originalFindById;
  }

  console.log('ALL MENTORSHIP AUTHORIZATION TESTS PASSED (6/6)!');
}

runTests().catch((err) => {
  console.error('[FAIL] Mentorship Auth test failed:', err);
  process.exit(1);
});
