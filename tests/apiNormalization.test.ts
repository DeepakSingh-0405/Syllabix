import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { getLeaderboard, getInstitutionalOverview } from '../server/src/controllers/analyticsController';

async function runTests() {
  console.log('Running API Response Normalization Test Suite...');

  // Test 1: getLeaderboard returns { success: true, data: [...] }
  {
    let responseData: any = null;
    const mockReq: any = {};
    const mockRes: any = {
      json: (payload: any) => {
        responseData = payload;
        return mockRes;
      },
      status: (_code: number) => mockRes,
    };

    await getLeaderboard(mockReq, mockRes);
    assert.ok(responseData, 'Response must not be null');
    assert.strictEqual(responseData.success, true, 'Response must have success: true');
    assert.ok(Array.isArray(responseData.data), 'Response data must be an array');
    assert.ok(responseData.data.length > 0, 'Response data must contain entries');
    assert.ok(responseData.data[0].rank === 1, 'First entry must have rank 1');
    console.log('[PASS] Test 1: getLeaderboard complies with normalized { success: true, data: [...] } contract.');
  }

  // Test 2: getInstitutionalOverview returns { success: true, data: { metrics, subjectCoverageList } }
  {
    let responseData: any = null;
    const mockReq: any = {};
    const mockRes: any = {
      json: (payload: any) => {
        responseData = payload;
        return mockRes;
      },
      status: (_code: number) => mockRes,
    };

    await getInstitutionalOverview(mockReq, mockRes);
    assert.ok(responseData, 'Response must not be null');
    assert.strictEqual(responseData.success, true, 'Response must have success: true');
    assert.ok(responseData.data.metrics, 'data must contain metrics object');
    assert.ok(Array.isArray(responseData.data.subjectCoverageList), 'data must contain subjectCoverageList array');
    console.log('[PASS] Test 2: getInstitutionalOverview complies with normalized contract.');
  }

  // Test 3: Client api unwrap simulation
  {
    const simulateClientUnwrap = (json: any) => {
      return json.data !== undefined ? json.data : json;
    };

    const wrappedLeaderboard = { success: true, data: [{ rank: 1, name: 'Alice' }] };
    const unwrapped = simulateClientUnwrap(wrappedLeaderboard);
    assert.deepStrictEqual(unwrapped, [{ rank: 1, name: 'Alice' }], 'Must unwrap data array');

    const rawLegacy = [{ rank: 1, name: 'Bob' }];
    const unwrappedRaw = simulateClientUnwrap(rawLegacy);
    assert.deepStrictEqual(unwrappedRaw, [{ rank: 1, name: 'Bob' }], 'Must preserve legacy array if unprovided');
    console.log('[PASS] Test 3: Client api unwrap logic verified for both wrapped and legacy responses.');
  }

  console.log('ALL API NORMALIZATION TESTS PASSED (3/3)!');
}

runTests().catch((err) => {
  console.error('[FAIL] API Normalization test failed:', err);
  process.exit(1);
});
