import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { formatSanitizedError } from '../server/src/utils/sanitize';
import { errorHandler } from '../server/src/middleware/errorHandler';

async function runTests() {
  console.log('Running Server Error Sanitization Test Suite...');

  const originalEnv = process.env.NODE_ENV;

  try {
    const sensitiveError = new Error('MongoServerError: connect ECONNREFUSED 127.0.0.1:27017 at /app/server/src/config/database.ts:42:15');
    sensitiveError.stack = 'Error: MongoServerError at Object.<anonymous> (/var/www/syllabix/server/dist/server.js:142:11)';

    // Test 1: In development, error message and stack trace are preserved for debugging
    {
      process.env.NODE_ENV = 'development';
      const result = formatSanitizedError(sensitiveError, 'An unexpected internal server error occurred.');
      assert.strictEqual(result.message, sensitiveError.message, 'Dev mode must preserve error message');
      assert.strictEqual(result.stack, sensitiveError.stack, 'Dev mode must preserve stack trace');
      assert.strictEqual(result.code, 'INTERNAL_SERVER_ERROR');
      console.log('[PASS] Test 1: Development mode preserves diagnostic messages and stack trace.');
    }

    // Test 2: In production, stack trace is completely omitted
    {
      process.env.NODE_ENV = 'production';
      const result = formatSanitizedError(sensitiveError, 'An unexpected internal server error occurred.');
      assert.strictEqual(result.stack, undefined, 'Production mode must NEVER return a stack trace');
      console.log('[PASS] Test 2: Production mode completely suppresses stack traces.');
    }

    // Test 3: In production, sensitive crash details are replaced with sanitized fallback
    {
      process.env.NODE_ENV = 'production';
      const result = formatSanitizedError(sensitiveError, 'An unexpected internal server error occurred.');
      assert.strictEqual(
        result.message,
        'An unexpected internal server error occurred.',
        'Production mode must use safe sanitized fallback'
      );
      assert.ok(!result.message.includes('/var/www'), 'Must not leak file paths');
      assert.ok(!result.message.includes('127.0.0.1'), 'Must not leak IP or port numbers');
      console.log('[PASS] Test 3: Sensitive filesystem and socket paths sanitized in production.');
    }

    // Test 4: Central errorHandler middleware suppresses stack and message in production
    {
      process.env.NODE_ENV = 'production';
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      errorHandler(sensitiveError, {} as any, res, (() => {}) as any);
      assert.strictEqual(statusCode, 500);
      assert.strictEqual(jsonPayload.success, false);
      assert.strictEqual(jsonPayload.error.message, 'An unexpected internal server error occurred.');
      assert.strictEqual(jsonPayload.error.stack, undefined, 'Production middleware must omit stack');
      console.log('[PASS] Test 4: Global errorHandler middleware sanitizes responses in production.');
    }

    // Test 5: Central errorHandler preserves stack in development
    {
      process.env.NODE_ENV = 'development';
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      errorHandler(sensitiveError, {} as any, res, (() => {}) as any);
      assert.strictEqual(statusCode, 500);
      assert.strictEqual(jsonPayload.success, false);
      assert.strictEqual(jsonPayload.error.message, sensitiveError.message);
      assert.ok(jsonPayload.error.stack, 'Development middleware must include stack trace');
      console.log('[PASS] Test 5: Global errorHandler middleware provides helpful stack in development.');
    }

    console.log('\nAll 5 Error Sanitization tests PASSED successfully!\n');
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
}

runTests();
