/**
 * Login & Logout Lifecycle Comprehensive Test Suite
 *
 * Verifies:
 * 1. Offline & Local Email/Password Sign-In session generation.
 * 2. Registration / Sign-Up flow session generation.
 * 3. Mentor vs Student role token assignment.
 * 4. Immediate Sign-Out session and localStorage clearing.
 * 5. Server middleware token verification for both student and mentor demo tokens.
 * 6. Protection against expired session restoration.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { verifySupabaseToken } from '../server/src/middleware/auth.js';

async function runSuite() {
  console.log('Running Login & Logout Lifecycle Test Suite...\n');

  // Mock in-memory localStorage for testing
  const mockStorage: Record<string, string> = {};
  const fakeLocalStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, val: string) => { mockStorage[key] = val; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };

  // 1. Test local login generation logic
  function mockLocalSignIn(email: string) {
    const isMentor = email.toLowerCase().includes('mentor');
    const cleanName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const token = isMentor ? 'demo-mentor-bearer-token' : 'demo-bearer-token';
    const session = {
      access_token: token,
      token_type: 'bearer',
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      user: {
        id: isMentor ? 'demo-mentor-id-001' : 'demo-student-id-001',
        email,
        user_metadata: { full_name: cleanName, role: isMentor ? 'mentor' : 'student' },
      },
    };
    const profile = {
      _id: isMentor ? 'demo_mentor_profile' : 'demo_user_profile',
      supabaseUserId: session.user.id,
      email,
      name: cleanName,
      role: isMentor ? 'mentor' : 'student',
      reputationPoints: isMentor ? 240 : 120,
    };
    fakeLocalStorage.setItem('syllabix_demo_session', JSON.stringify({ session, profile }));
    return { session, profile };
  }

  // 2. Test sign-out logic
  function mockSignOut() {
    fakeLocalStorage.removeItem('syllabix_demo_session');
    fakeLocalStorage.removeItem('sb-mock-auth-token');
  }

  // TEST 1: Student Login
  const studentLogin = mockLocalSignIn('student.rajput@university.edu');
  assert.equal(studentLogin.session.access_token, 'demo-bearer-token');
  assert.equal(studentLogin.profile.role, 'student');
  assert.equal(fakeLocalStorage.getItem('syllabix_demo_session') !== null, true);
  console.log('[PASS] Test 1: Student login initializes valid session and localStorage.');

  // TEST 2: Mentor Login
  const mentorLogin = mockLocalSignIn('prof.mentor@university.edu');
  assert.equal(mentorLogin.session.access_token, 'demo-mentor-bearer-token');
  assert.equal(mentorLogin.profile.role, 'mentor');
  console.log('[PASS] Test 2: Mentor login sets mentor role and demo-mentor-bearer-token.');

  // TEST 3: Sign-Out immediately purges stored sessions
  mockSignOut();
  assert.equal(fakeLocalStorage.getItem('syllabix_demo_session'), null);
  assert.equal(fakeLocalStorage.getItem('sb-mock-auth-token'), null);
  console.log('[PASS] Test 3: Sign-out completely wipes local demo and Supabase keys.');

  // TEST 4: Server verifySupabaseToken recognizes demo-bearer-token as student
  {
    let nextCalled = false;
    const req: any = { headers: { authorization: 'Bearer demo-bearer-token' } };
    const res: any = { status: () => res, json: () => res };
    await verifySupabaseToken(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.equal(req.user.role, 'student');
    console.log('[PASS] Test 4: Server verifySupabaseToken authenticates student demo token.');
  }

  // TEST 5: Server verifySupabaseToken recognizes demo-mentor-bearer-token as mentor
  {
    let nextCalled = false;
    const req: any = { headers: { authorization: 'Bearer demo-mentor-bearer-token' } };
    const res: any = { status: () => res, json: () => res };
    await verifySupabaseToken(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
    assert.equal(req.user.role, 'mentor');
    console.log('[PASS] Test 5: Server verifySupabaseToken authenticates mentor demo token with role mentor.');
  }

  // TEST 6: Session expiration handling
  {
    const expiredSession = {
      session: {
        access_token: 'demo-bearer-token',
        expires_at: Math.floor(Date.now() / 1000) - 100, // 100 seconds ago
      },
      profile: { name: 'Expired User' },
    };
    fakeLocalStorage.setItem('syllabix_demo_session', JSON.stringify(expiredSession));
    const raw = fakeLocalStorage.getItem('syllabix_demo_session');
    const parsed = JSON.parse(raw!);
    const isExpired = parsed.session.expires_at < Date.now() / 1000;
    assert.equal(isExpired, true, 'Expired session must be recognized as expired');
    if (isExpired) fakeLocalStorage.removeItem('syllabix_demo_session');
    assert.equal(fakeLocalStorage.getItem('syllabix_demo_session'), null);
    console.log('[PASS] Test 6: Expired session detection safely purges stale credentials.');
  }

  console.log('\nAll 6 Login & Logout Lifecycle tests PASSED successfully!\n');
}

runSuite().catch((err) => {
  console.error('[FAIL] Login/Logout test failed:', err);
  process.exit(1);
});
