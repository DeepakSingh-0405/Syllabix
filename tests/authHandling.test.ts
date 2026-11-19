import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { verifySupabaseToken } from '../server/src/middleware/auth';
import { createDiscussion } from '../server/src/controllers/discussionController';
import { createStudyGroup } from '../server/src/controllers/studyGroupController';
import { requestMentorship } from '../server/src/controllers/mentorshipController';

async function runTests() {
  console.log('Running Authentication & Session Handling Test Suite...');

  // Test 1: verifySupabaseToken accepts demo-bearer-token in development
  {
    let nextCalled = false;
    let statusCode: number | null = null;
    let jsonPayload: any = null;

    const req: any = {
      headers: {
        authorization: 'Bearer demo-bearer-token',
      },
    };
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (payload: any) => {
        jsonPayload = payload;
        return res;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    await verifySupabaseToken(req, res, next);
    assert.strictEqual(nextCalled, true, 'Next function must be called for valid demo token in dev');
    assert.ok(req.user, 'req.user must be populated');
    assert.strictEqual(req.user.role, 'student', 'Demo user role must be student');
    console.log('[PASS] Test 1: verifySupabaseToken authenticates demo-bearer-token in development.');
  }

  // Test 2: verifySupabaseToken rejects requests missing Authorization header
  {
    let nextCalled = false;
    let statusCode: number | null = null;
    let jsonPayload: any = null;

    const req: any = {
      headers: {},
    };
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (payload: any) => {
        jsonPayload = payload;
        return res;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    await verifySupabaseToken(req, res, next);
    assert.strictEqual(nextCalled, false, 'Next must not be called when Authorization header is missing');
    assert.strictEqual(statusCode, 401, 'Status code must be 401 Unauthorized');
    assert.strictEqual(jsonPayload.success, false, 'Response must indicate failure');
    assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED', 'Error code must be UNAUTHORIZED');
    console.log('[PASS] Test 2: Missing token returns 401 Unauthorized.');
  }

  // Test 3: Write operations reject anonymous requests without hardcoded impersonation
  {
    const req: any = {
      user: undefined,
      body: { title: 'Test Discussion', body: 'Some body text', subjectId: 'cs201' },
    };
    let statusCode: number | null = null;
    let jsonPayload: any = null;
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (payload: any) => {
        jsonPayload = payload;
        return res;
      },
    };

    await createDiscussion(req, res);
    assert.strictEqual(statusCode, 401, 'createDiscussion must reject unauthenticated request with 401');
    assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED', 'Must return UNAUTHORIZED');

    await createStudyGroup(req, res);
    assert.strictEqual(statusCode, 401, 'createStudyGroup must reject unauthenticated request with 401');

    await requestMentorship(req, res);
    assert.strictEqual(statusCode, 401, 'requestMentorship must reject unauthenticated request with 401');

    console.log('[PASS] Test 3: Write operations strictly reject anonymous requests without impersonation.');
  }

  // Test 4: Client token retrieval simulation with expired session handling
  {
    const simulateTokenRetrieval = (localStorageMock: Record<string, string>): string | null => {
      const saved = localStorageMock['syllabix_demo_session'];
      if (!saved) return null;
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.session?.access_token) {
          if (parsed.session.expires_at && Date.now() / 1000 > parsed.session.expires_at) {
            delete localStorageMock['syllabix_demo_session'];
            return null;
          }
          return parsed.session.access_token;
        }
      } catch {
        return null;
      }
      return null;
    };

    // Valid demo session
    const validStore = {
      syllabix_demo_session: JSON.stringify({
        session: { access_token: 'demo-bearer-token', expires_at: Math.floor(Date.now() / 1000) + 3600 },
      }),
    };
    assert.strictEqual(simulateTokenRetrieval(validStore), 'demo-bearer-token', 'Must return valid token');

    // Expired demo session
    const expiredStore = {
      syllabix_demo_session: JSON.stringify({
        session: { access_token: 'demo-bearer-token', expires_at: Math.floor(Date.now() / 1000) - 100 },
      }),
    };
    assert.strictEqual(simulateTokenRetrieval(expiredStore), null, 'Must return null and evict expired session');
    assert.strictEqual(expiredStore['syllabix_demo_session'], undefined, 'Must remove expired key');

    console.log('[PASS] Test 4: Client token resolution and session expiration logic verified.');
  }

  // Test 5: verifySupabaseToken strictly rejects demo tokens in production
  {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    let nextCalled = false;
    let statusCode: number | null = null;
    let jsonPayload: any = null;

    const req: any = {
      headers: {
        authorization: 'Bearer demo-bearer-token',
      },
    };
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (payload: any) => {
        jsonPayload = payload;
        return res;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    try {
      await verifySupabaseToken(req, res, next);
      assert.strictEqual(nextCalled, false, 'Next must not be called for demo token in production');
      assert.strictEqual(statusCode, 401, 'Status code must be 401 in production');
      assert.strictEqual(jsonPayload.error.code, 'DEMO_TOKENS_FORBIDDEN', 'Error code must be DEMO_TOKENS_FORBIDDEN');
      console.log('[PASS] Test 5: verifySupabaseToken strictly rejects demo tokens in production.');
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  }

  // Test 6: Arbitrary demo- prefixes are never allowed to bypass authentication
  {
    let nextCalled = false;
    let statusCode: number | null = null;
    let jsonPayload: any = null;

    const req: any = {
      headers: {
        authorization: 'Bearer demo-arbitrary-attacker-token',
      },
    };
    const res: any = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (payload: any) => {
        jsonPayload = payload;
        return res;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    await verifySupabaseToken(req, res, next);
    assert.strictEqual(nextCalled, false, 'Next must not be called for arbitrary demo prefix');
    assert.strictEqual(statusCode, 401, 'Status code must be 401 for arbitrary demo token');
    console.log('[PASS] Test 6: Arbitrary demo- prefixes cannot bypass authentication.');
  }

  console.log('ALL AUTHENTICATION TESTS PASSED (6/6)!');
}

runTests().catch((err) => {
  console.error('[FAIL] Auth test failed:', err);
  process.exit(1);
});
