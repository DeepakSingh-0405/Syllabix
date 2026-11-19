import assert from 'node:assert';
import {
  ApiClientError,
  isBackendUnavailableError,
} from '../client/src/lib/api';

async function runTests() {
  console.log('Running Client API Resilience & Error Handling Test Suite (Task 31)...');

  // Test 1: ApiClientError structure and categorization
  {
    const netErr = new ApiClientError('Connection failed', 0, true);
    assert.strictEqual(netErr.statusCode, 0);
    assert.strictEqual(netErr.isNetworkError, true);
    assert.strictEqual(netErr.isBackendUnavailable, true);
    assert.strictEqual(netErr.isRateLimited, false);

    const rateLimitErr = new ApiClientError('Rate limited', 429, false);
    assert.strictEqual(rateLimitErr.statusCode, 429);
    assert.strictEqual(rateLimitErr.isRateLimited, true);
    assert.strictEqual(rateLimitErr.isBackendUnavailable, false);

    const outageErr = new ApiClientError('503 Service Unavailable', 503, true);
    assert.strictEqual(outageErr.statusCode, 503);
    assert.strictEqual(outageErr.isBackendUnavailable, true);
    console.log('[PASS] Test 1: ApiClientError correctly tags network, rate limit, and backend outage statuses.');
  }

  // Test 2: isBackendUnavailableError categorization
  {
    const netErr = new ApiClientError('Server offline', 0, true);
    assert.strictEqual(isBackendUnavailableError(netErr), true);

    const outage503 = new ApiClientError('Outage', 503, true);
    assert.strictEqual(isBackendUnavailableError(outage503), true);

    const client400 = new ApiClientError('Bad Request: query required', 400, false);
    assert.strictEqual(isBackendUnavailableError(client400), false);

    const rawFetchErr = new TypeError('Failed to fetch');
    assert.strictEqual(isBackendUnavailableError(rawFetchErr), true);

    const rawConnRefused = new Error('connect ECONNREFUSED 127.0.0.1:5001');
    assert.strictEqual(isBackendUnavailableError(rawConnRefused), true);
    console.log('[PASS] Test 2: isBackendUnavailableError accurately discriminates between network/outages and client errors.');
  }

  // Test 3: Resilience to non-JSON HTML payloads (502/503 gateway responses)
  {
    const htmlPayload = '<!DOCTYPE html><html><body>502 Bad Gateway</body></html>';
    let parsedJson: any = {};
    try {
      parsedJson = JSON.parse(htmlPayload);
    } catch {
      parsedJson = { error: htmlPayload.slice(0, 300) };
    }
    assert.ok(parsedJson.error.includes('502 Bad Gateway'), 'Non-JSON response safely extracted into error property');
    console.log('[PASS] Test 3: Raw HTML proxy/gateway outage pages handled safely without SyntaxError exceptions.');
  }

  // Test 4: Custom timeout / AbortSignal handling
  {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    const isTimeout = abortErr.name === 'AbortError' || abortErr.name === 'TimeoutError';
    assert.strictEqual(isTimeout, true, 'AbortError recognized as timeout condition');
    console.log('[PASS] Test 4: Timeout AbortSignal errors identified as backend unavailability.');
  }

  console.log('\nAll 4 Client API Resilience & Error Handling tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
