import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  verifiedResourceFilter,
  getInstitutionalOverview,
} from '../server/src/controllers/analyticsController';

function matchesVerifiedFilter(doc: Record<string, any>): boolean {
  for (const condition of verifiedResourceFilter.$or) {
    let matches = true;
    for (const [key, expectedValue] of Object.entries(condition)) {
      if (doc[key] !== expectedValue) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }
  return false;
}

async function runTests() {
  console.log('Running Verified Resource Query Test Suite (Task 18)...');

  // Test 1: verifiedResourceFilter contains both current and migration criteria
  {
    assert.ok(verifiedResourceFilter, 'Filter must be defined and exported');
    assert.ok(Array.isArray(verifiedResourceFilter.$or), 'Filter must use $or clause');
    const clauses = verifiedResourceFilter.$or;
    const hasIsVerified = clauses.some((c: any) => c.isVerified === true);
    const hasStatus = clauses.some((c: any) => c.status === 'verified');
    const hasVerificationStatus = clauses.some((c: any) => c.verificationStatus === 'verified');

    assert.ok(hasIsVerified, 'Filter must check isVerified: true (schema primary)');
    assert.ok(hasStatus, 'Filter must check status: verified (migration fallback)');
    assert.ok(hasVerificationStatus, 'Filter must check verificationStatus: verified (legacy fallback)');
    console.log('[PASS] Test 1: verifiedResourceFilter correctly covers current isVerified schema and migration fallbacks.');
  }

  // Test 2: Current schema resource { isVerified: true } matches filter
  {
    const currentDoc = {
      title: 'Operating Systems Syllabus',
      isVerified: true,
      status: 'ready',
    };
    assert.strictEqual(matchesVerifiedFilter(currentDoc), true, 'Resource with isVerified: true must match');
    console.log('[PASS] Test 2: Standard schema resource with isVerified: true is accurately matched.');
  }

  // Test 3: Unverified resource { isVerified: false, status: 'uploading' } is rejected
  {
    const unverifiedDoc = {
      title: 'Draft Notes',
      isVerified: false,
      status: 'uploading',
    };
    assert.strictEqual(matchesVerifiedFilter(unverifiedDoc), false, 'Unverified resource must not match');
    console.log('[PASS] Test 3: Unverified resource is safely excluded from metrics.');
  }

  // Test 4: Legacy schema documents match filter for seamless backward compatibility
  {
    const legacyDoc1 = {
      title: 'Legacy Notes 1',
      status: 'verified',
    };
    const legacyDoc2 = {
      title: 'Legacy Notes 2',
      verificationStatus: 'verified',
    };
    assert.strictEqual(matchesVerifiedFilter(legacyDoc1), true, 'status: verified must match');
    assert.strictEqual(matchesVerifiedFilter(legacyDoc2), true, 'verificationStatus: verified must match');
    console.log('[PASS] Test 4: Legacy documents with status/verificationStatus match without migration breakage.');
  }

  // Test 5: getInstitutionalOverview includes verifiedResources count in response
  {
    let responsePayload: any = null;
    const mockReq: any = {};
    const mockRes: any = {
      json: (data: any) => {
        responsePayload = data;
        return mockRes;
      },
      status: (_code: number) => mockRes,
    };

    await getInstitutionalOverview(mockReq, mockRes);
    assert.ok(responsePayload?.data?.metrics, 'Response must contain metrics');
    assert.ok(
      typeof responsePayload.data.metrics.verifiedResources === 'number',
      'verifiedResources metric must be a number'
    );
    assert.ok(
      responsePayload.data.metrics.verifiedResources > 0,
      'verifiedResources metric must be greater than 0'
    );
    console.log('[PASS] Test 5: getInstitutionalOverview delivers verifiedResources count accurately.');
  }

  console.log('\nAll 5 Verified Resource Query tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
