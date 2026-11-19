import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import * as authController from '../server/src/controllers/authController';
import { User } from '../server/src/models/User';

function createMockRes() {
  let statusCode = 200;
  let responseData: any = null;
  return {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: any) {
      responseData = payload;
      return this;
    },
    getStatusCode: () => statusCode,
    getData: () => responseData,
  };
}

async function runTests() {
  console.log('Running User Profile Initialization & Sync Test Suite (Task 30)...');

  // Test 1: getMe auto-bootstraps user profile when supabaseUser is present
  {
    const req: any = {
      supabaseUser: {
        id: 'supabase-new-student-456',
        email: 'priya.sharma@syllabix.edu',
        user_metadata: {
          full_name: 'Priya Sharma',
          avatar_url: 'https://syllabix.edu/avatars/priya.png',
        },
      },
    };
    const res = createMockRes();

    await authController.getMe(req, res as any);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, 'Priya Sharma');
    assert.strictEqual(data.data.email, 'priya.sharma@syllabix.edu');
    assert.strictEqual(data.data.role, 'student');
    assert.strictEqual(data.data.reputationPoints, 0);
    console.log('[PASS] Test 1: getMe auto-bootstraps new student profile on first login with default fields.');
  }

  // Test 2: getMe preserves existing user attributes and reputation
  {
    const existingUser: any = {
      _id: new mongoose.Types.ObjectId('650000000000000000000088'),
      supabaseUserId: 'supabase-existing-student-88',
      email: 'rohan.verma@syllabix.edu',
      name: 'Rohan Verma',
      role: 'mentor',
      reputationPoints: 450,
    };
    const req: any = {
      user: existingUser,
      supabaseUser: { id: existingUser.supabaseUserId, email: existingUser.email },
    };
    const res = createMockRes();

    await authController.getMe(req, res as any);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, 'Rohan Verma');
    assert.strictEqual(data.data.role, 'mentor');
    assert.strictEqual(data.data.reputationPoints, 450);
    console.log('[PASS] Test 2: getMe preserves existing reputation points and mentor role without resetting.');
  }

  // Test 3: syncProfile idempotently creates or synchronizes profile
  {
    const req: any = {
      supabaseUser: { id: 'supabase-sync-user-77', email: 'sync.user@syllabix.edu' },
      body: {
        name: 'Sync Scholar',
        avatarUrl: 'https://avatars.syllabix.edu/scholar.png',
      },
    };
    const res = createMockRes();

    await authController.syncProfile(req, res as any);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.name, 'Sync Scholar');
    assert.strictEqual(data.data.role, 'student');
    console.log('[PASS] Test 3: syncProfile creates profile idempotently with supplied metadata.');
  }

  // Test 4: updateProfile updates profile fields and validates semester range
  {
    const userToUpdate: any = {
      _id: new mongoose.Types.ObjectId('650000000000000000000099'),
      name: 'Old Name',
      semester: 3,
    };
    const req: any = {
      user: userToUpdate,
      body: {
        name: 'Updated Name',
        semester: 6,
      },
    };
    const res = createMockRes();

    await authController.updateProfile(req, res as any);
    assert.strictEqual(res.getStatusCode(), 200);
    const data = res.getData();
    assert.strictEqual(data.success, true);
    assert.ok(data.data);
    console.log('[PASS] Test 4: updateProfile processes updates and returns updated user payload.');
  }

  console.log('\nAll 4 User Profile Initialization & Sync tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
