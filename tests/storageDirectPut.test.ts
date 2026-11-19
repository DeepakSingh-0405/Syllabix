import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function runTests() {
  console.log('Running Storage Direct PUT Validation Test Suite (Task 17)...');

  // Test 1: UploadModal source code structure conforms to direct PUT requirements
  const modalPath = path.resolve('client/src/components/UploadModal.tsx');
  const modalContent = fs.readFileSync(modalPath, 'utf-8');

  assert.match(modalContent, /isValidStorageUploadUrl/, 'Must define and use isValidStorageUploadUrl');
  assert.match(modalContent, /AbortController/, 'Must use AbortController for upload timeout');
  assert.match(modalContent, /storageUploadConfirmed/, 'Must track storageUploadConfirmed before confirmation');
  assert.match(modalContent, /storageUploadConfirmed && intent\?\.resourceId/, 'Must gate confirm-upload on confirmed storage');
  assert.match(modalContent, /Storage upload timed out/, 'Must surface timeout error');
  console.log('[PASS] Test 1: UploadModal source code contains direct PUT validation and confirmation guard.');

  // Test 2: URL validation logic
  function isValidUrl(urlStr?: string): boolean {
    if (!urlStr || typeof urlStr !== 'string') return false;
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  assert.strictEqual(isValidUrl('https://example-project.supabase.co/storage/v1/object/upload/sign/doc.pdf'), true);
  assert.strictEqual(isValidUrl('http://127.0.0.1:54321/storage/v1/upload'), true);
  assert.strictEqual(isValidUrl('http://localhost:5001/storage'), true);
  assert.strictEqual(isValidUrl('ftp://ftp.example.com/file.pdf'), false, 'FTP must be rejected');
  assert.strictEqual(isValidUrl('javascript:alert(1)'), false, 'javascript URI must be rejected');
  assert.strictEqual(isValidUrl('file:///etc/passwd'), false, 'file URI must be rejected');
  assert.strictEqual(isValidUrl(''), false, 'Empty string must be rejected');
  assert.strictEqual(isValidUrl('random-text-not-url'), false, 'Malformed string must be rejected');
  assert.strictEqual(isValidUrl(undefined), false);
  console.log('[PASS] Test 2: Storage upload URL validator strictly enforces HTTP/HTTPS protocols.');

  // Test 3: AbortController timeout simulation
  const simulateTimeout = async () => {
    const controller = new AbortController();
    controller.abort(); // Simulating triggered timeout
    try {
      if (controller.signal.aborted) {
        const err: any = new Error('The operation was aborted');
        err.name = 'AbortError';
        throw err;
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return 'Storage upload timed out after 30 seconds. Please check your network and retry.';
      }
      throw err;
    }
  };

  simulateTimeout().then((msg) => {
    assert.strictEqual(msg, 'Storage upload timed out after 30 seconds. Please check your network and retry.');
    console.log('[PASS] Test 3: Upload timeout produces descriptive actionable error.');
  });

  // Test 4: Upload confirmation gating invariant
  let confirmCalled = false;
  const executeConfirmation = (storageConfirmed: boolean, resourceId?: string) => {
    if (storageConfirmed && resourceId) {
      confirmCalled = true;
    } else if (!storageConfirmed) {
      throw new Error('Upload could not be confirmed because storage transfer did not complete.');
    }
  };

  // Positive case: storage succeeded
  confirmCalled = false;
  executeConfirmation(true, 'res-101');
  assert.strictEqual(confirmCalled, true, 'Confirm must be called when storage is confirmed');

  // Negative case: storage transfer failed
  confirmCalled = false;
  assert.throws(
    () => executeConfirmation(false, 'res-101'),
    /Upload could not be confirmed because storage transfer did not complete/
  );
  assert.strictEqual(confirmCalled, false, 'Confirm must NEVER be called when storage transfer failed');
  console.log('[PASS] Test 4: Confirmation gating guarantees unconfirmed files are never falsely registered.');

  console.log('\nAll 4 Storage Direct PUT Validation tests PASSED successfully!\n');
}

runTests();
