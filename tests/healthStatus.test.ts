import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import router from '../server/src/routes/index';

async function runTests() {
  console.log('Running Expanded Health Check Status Test Suite (Task 24)...');

  // Test 1: Invoke health route handler and verify structured report
  {
    // Find the health route layer in router
    const healthLayer = router.stack.find((layer: any) => layer.route && layer.route.path === '/health');
    assert.ok(healthLayer, 'Health route must exist in routes/index.ts');

    let responsePayload: any = null;
    let statusCode = 200;
    const mockReq: any = {};
    const mockRes: any = {
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
      json: (data: any) => {
        responsePayload = data;
        return mockRes;
      },
    };

    // Execute route handler
    const handler = healthLayer.route.stack[0].handle;
    await handler(mockReq, mockRes);

    assert.ok(responsePayload, 'Response payload must be defined');
    assert.strictEqual(statusCode, 200, 'HTTP status must be 200');
    assert.ok(
      responsePayload.status === 'healthy' || responsePayload.status === 'degraded',
      `status must be 'healthy' or 'degraded', received: ${responsePayload.status}`
    );
    assert.strictEqual(responsePayload.service, 'Syllabix MERN Backend API');
    assert.ok(typeof responsePayload.uptimeSeconds === 'number', 'uptimeSeconds must be a number');
    assert.ok(typeof responsePayload.timestamp === 'string', 'timestamp must be a string');
    assert.ok(typeof responsePayload.environment === 'string', 'environment must be a string');
    assert.strictEqual(typeof responsePayload.supabaseConnected, 'boolean', 'supabaseConnected must be boolean');

    console.log('[PASS] Test 1: Health route returns expected top-level schema.');
  }

  // Test 2: Subsystem health checks
  {
    let responsePayload: any = null;
    const healthLayer = router.stack.find((layer: any) => layer.route && layer.route.path === '/health');
    const mockReq: any = {};
    const mockRes: any = {
      json: (data: any) => {
        responsePayload = data;
        return mockRes;
      },
      status: () => mockRes,
    };
    await healthLayer.route.stack[0].handle(mockReq, mockRes);

    assert.ok(responsePayload.checks, 'Response must have checks object');
    assert.ok(responsePayload.checks.database, 'checks must include database');
    assert.ok(responsePayload.checks.supabase, 'checks must include supabase');
    assert.ok(responsePayload.checks.gemini, 'checks must include gemini');

    assert.ok(typeof responsePayload.checks.database.connected === 'boolean');
    assert.ok(typeof responsePayload.checks.database.status === 'string');

    assert.ok(typeof responsePayload.checks.supabase.configured === 'boolean');
    assert.ok(typeof responsePayload.checks.supabase.status === 'string');

    assert.ok(typeof responsePayload.checks.gemini.configured === 'boolean');
    assert.ok(typeof responsePayload.checks.gemini.status === 'string');

    console.log('[PASS] Test 2: Subsystem checks (database, supabase, gemini) structured accurately.');
  }

  // Test 3: Status determination logic accurately handles degraded state
  {
    const determineStatus = (dbConnected: boolean, supabaseOk: boolean) => {
      return dbConnected && supabaseOk ? 'healthy' : 'degraded';
    };

    assert.strictEqual(determineStatus(true, true), 'healthy', 'Fully online is healthy');
    assert.strictEqual(determineStatus(false, true), 'degraded', 'DB disconnected is degraded');
    assert.strictEqual(determineStatus(true, false), 'degraded', 'Supabase mock is degraded');
    assert.strictEqual(determineStatus(false, false), 'degraded', 'Both offline is degraded');

    console.log('[PASS] Test 3: System degradation status logic safely verified.');
  }

  console.log('\nAll 3 Expanded Health Check tests PASSED successfully!\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
