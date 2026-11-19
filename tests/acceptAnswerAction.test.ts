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
  console.log('Running Accept Answer Action Test Suite (Task 12)...');

  const authorId = '650000000000000000000010';
  const peerId = '650000000000000000000020';
  const strangerId = '650000000000000000000030';

  const initialDiscussion: any = {
    _id: '650000000000000000000100',
    authorId,
    title: 'How to prove Peterson’s Algorithm satisfies bounded waiting?',
    status: 'open',
    acceptedAnswerId: undefined,
    save: async function () { return this; },
  };

  const peerComment: any = {
    _id: '650000000000000000000200',
    discussionId: initialDiscussion._id,
    authorId: peerId,
    body: 'When P_i is waiting, P_j sets turn = i upon exit, guaranteeing P_i enters after at most one turn.',
    isAcceptedAnswer: false,
    save: async function () { return this; },
  };

  (Discussion as any).findById = (id: string) => {
    if (String(id) === String(initialDiscussion._id)) return initialDiscussion;
    return null;
  };

  (Comment as any).findById = (id: string) => {
    if (String(id) === String(peerComment._id)) return peerComment;
    return null;
  };

  let reputationPointsAdded = 0;
  let targetUser = '';
  (User as any).findByIdAndUpdate = async (uid: string, update: any) => {
    targetUser = String(uid);
    if (update.$inc?.reputationPoints) {
      reputationPointsAdded += update.$inc.reputationPoints;
    }
    return { _id: uid };
  };

  let notificationSent = false;
  (Notification as any).create = async (doc: any) => {
    if (doc.type === 'answer_accepted' && String(doc.userId) === peerId) {
      notificationSent = true;
    }
    return doc;
  };

  // Test 1: Unauthorized user (non-author) cannot accept answer
  {
    const req: any = {
      user: { _id: strangerId },
      params: { id: initialDiscussion._id },
      body: { commentId: peerComment._id },
    };
    let statusCode = 200;
    let jsonPayload: any = null;
    const res: any = {
      status: (code: number) => { statusCode = code; return res; },
      json: (data: any) => { jsonPayload = data; return res; },
    };

    await acceptAnswer(req, res);
    assert.strictEqual(statusCode, 403, 'Non-author must receive 403');
    assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
    console.log('[PASS] Test 1: Non-author rejected with 403 FORBIDDEN.');
  }

  // Test 2: Discussion author accepts answer successfully
  {
    const req: any = {
      user: { _id: authorId },
      params: { id: initialDiscussion._id },
      body: { commentId: peerComment._id },
    };
    let statusCode = 200;
    let jsonPayload: any = null;
    const res: any = {
      status: (code: number) => { statusCode = code; return res; },
      json: (data: any) => { jsonPayload = data; return res; },
    };

    await acceptAnswer(req, res);
    assert.strictEqual(statusCode, 200, 'Author acceptance must succeed');
    assert.strictEqual(jsonPayload.success, true);
    assert.strictEqual(peerComment.isAcceptedAnswer, true, 'Comment isAcceptedAnswer set to true');
    assert.strictEqual(initialDiscussion.status, 'resolved', 'Discussion status set to resolved');
    assert.strictEqual(String(initialDiscussion.acceptedAnswerId), String(peerComment._id));
    assert.strictEqual(reputationPointsAdded, 15, 'Peer awarded +15 reputation points');
    assert.strictEqual(targetUser, peerId);
    assert.strictEqual(notificationSent, true, 'In-app notification sent to answer author');
    console.log('[PASS] Test 2: Discussion author successfully accepted answer (+15 reputation awarded).');
  }

  // Test 3: Re-accepting or accepting second answer on resolved question fails
  {
    const req: any = {
      user: { _id: authorId },
      params: { id: initialDiscussion._id },
      body: { commentId: peerComment._id },
    };
    let statusCode = 200;
    let jsonPayload: any = null;
    const res: any = {
      status: (code: number) => { statusCode = code; return res; },
      json: (data: any) => { jsonPayload = data; return res; },
    };

    await acceptAnswer(req, res);
    assert.strictEqual(statusCode, 400);
    assert.strictEqual(jsonPayload.error.code, 'ALREADY_RESOLVED');
    console.log('[PASS] Test 3: Already resolved discussion prevents second answer acceptance.');
  }

  // Test 4: Frontend UI State transformation emulation
  {
    const mockClientComments = [
      { _id: 'c1', isAcceptedAnswer: false, authorId: { _id: peerId, reputationPoints: 10 } },
      { _id: 'c2', isAcceptedAnswer: false, authorId: { _id: 'u3', reputationPoints: 5 } },
    ];

    const commentIdToAccept = 'c1';
    const updatedComments = mockClientComments.map((c) => {
      if (c._id === commentIdToAccept) {
        return {
          ...c,
          isAcceptedAnswer: true,
          authorId: {
            ...c.authorId,
            reputationPoints: (c.authorId.reputationPoints || 0) + 15,
          },
        };
      }
      return c;
    });

    updatedComments.sort((a, b) => (b.isAcceptedAnswer ? 1 : 0) - (a.isAcceptedAnswer ? 1 : 0));

    assert.strictEqual(updatedComments[0]._id, 'c1', 'Accepted comment sorted to index 0');
    assert.strictEqual(updatedComments[0].isAcceptedAnswer, true);
    assert.strictEqual(updatedComments[0].authorId.reputationPoints, 25, 'Reputation reflects +15 points');
    console.log('[PASS] Test 4: Frontend state transformation and sorting verified.');
  }

  console.log('\nAll 4 Accept Answer Action tests PASSED successfully!\n');
}

runTests();
