import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { getDownloadUrl, confirmUpload } from '../server/src/controllers/resourceController';
import { Resource } from '../server/src/models/Resource';
import { supabaseAdmin, BUCKETS } from '../server/src/config/supabase';

async function runTests() {
  console.log('Running Document Access Authorization Test Suite...');

  const ownerId = '650000000000000000000001';
  const otherUserId = '650000000000000000000002';
  const adminId = '650000000000000000000099';

  const mockPublicResource: any = {
    _id: '650000000000000000000101',
    ownerId,
    title: 'Public Data Structures Syllabus',
    storagePath: 'CS-201/test/public.pdf',
    isPrivate: false,
    status: 'ready',
    viewCount: 0,
    save: async () => mockPublicResource,
  };

  const mockPrivateResource: any = {
    _id: '650000000000000000000102',
    ownerId,
    title: 'Private Professor Notes',
    storagePath: 'CS-201/test/private.pdf',
    isPrivate: true,
    status: 'uploading',
    viewCount: 0,
    save: async () => mockPrivateResource,
  };

  // Mock Resource.findById and findByIdAndUpdate
  const originalFindById = (Resource as any).findById;
  const originalFindByIdAndUpdate = (Resource as any).findByIdAndUpdate;
  const originalStorageFrom = (supabaseAdmin.storage as any).from;

  (Resource as any).findById = (id: string) => {
    if (String(id) === String(mockPublicResource._id)) return mockPublicResource;
    if (String(id) === String(mockPrivateResource._id)) return mockPrivateResource;
    return null;
  };
  (Resource as any).findByIdAndUpdate = async (_id: string, update: any) => {
    if (update.$inc?.viewCount) {
      mockPublicResource.viewCount += update.$inc.viewCount;
    }
    return mockPublicResource;
  };

  // Mock Supabase storage
  (supabaseAdmin.storage as any).from = (_bucket: string) => ({
    createSignedUrl: async (storagePath: string, _expires: number) => ({
      data: { signedUrl: `https://storage.supabase.example.com/signed/${storagePath}` },
      error: null,
    }),
  });

  try {
    // Test 1: getDownloadUrl allows unauthenticated public document download
    {
      const req: any = { params: { id: mockPublicResource._id } };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getDownloadUrl(req, res);
      assert.strictEqual(statusCode, 200, 'Public document must download without auth');
      assert.strictEqual(jsonPayload.success, true);
      assert.ok(jsonPayload.data.downloadUrl.includes('public.pdf'));
      console.log('[PASS] Test 1: Public document downloaded without authentication.');
    }

    // Test 2: getDownloadUrl rejects unauthenticated access to private document with 401
    {
      const req: any = { params: { id: mockPrivateResource._id } };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getDownloadUrl(req, res);
      assert.strictEqual(statusCode, 401, 'Unauthenticated private document access must return 401');
      assert.strictEqual(jsonPayload.success, false);
      assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED');
      console.log('[PASS] Test 2: Unauthenticated private document access rejected with 401.');
    }

    // Test 3: getDownloadUrl rejects unauthorized user for private document with 403
    {
      const req: any = {
        user: { _id: otherUserId, role: 'student' },
        params: { id: mockPrivateResource._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getDownloadUrl(req, res);
      assert.strictEqual(statusCode, 403, 'Non-owner must be rejected with 403 Forbidden');
      assert.strictEqual(jsonPayload.success, false);
      assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
      console.log('[PASS] Test 3: Unauthorized user access to private document rejected with 403 Forbidden.');
    }

    // Test 4: getDownloadUrl allows resource owner to access private document
    {
      const req: any = {
        user: { _id: ownerId, role: 'student' },
        params: { id: mockPrivateResource._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getDownloadUrl(req, res);
      assert.strictEqual(statusCode, 200, 'Owner must be able to access private document');
      assert.strictEqual(jsonPayload.success, true);
      assert.ok(jsonPayload.data.downloadUrl.includes('private.pdf'));
      console.log('[PASS] Test 4: Resource owner successfully accessed private document.');
    }

    // Test 5: getDownloadUrl allows admin to access private document
    {
      const req: any = {
        user: { _id: adminId, role: 'admin' },
        params: { id: mockPrivateResource._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await getDownloadUrl(req, res);
      assert.strictEqual(statusCode, 200, 'Admin must be able to access private document');
      assert.strictEqual(jsonPayload.success, true);
      assert.ok(jsonPayload.data.downloadUrl.includes('private.pdf'));
      console.log('[PASS] Test 5: Admin successfully accessed private document.');
    }

    // Test 6: confirmUpload rejects unauthenticated request with 401
    {
      const req: any = { params: { id: mockPrivateResource._id } };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await confirmUpload(req, res);
      assert.strictEqual(statusCode, 401, 'Unauthenticated confirmUpload must return 401');
      assert.strictEqual(jsonPayload.error.code, 'UNAUTHORIZED');
      console.log('[PASS] Test 6: Unauthenticated confirmUpload rejected with 401.');
    }

    // Test 7: confirmUpload rejects non-owner with 403 Forbidden
    {
      const req: any = {
        user: { _id: otherUserId, role: 'student' },
        params: { id: mockPrivateResource._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await confirmUpload(req, res);
      assert.strictEqual(statusCode, 403, 'Non-owner confirmUpload must return 403 Forbidden');
      assert.strictEqual(jsonPayload.error.code, 'FORBIDDEN');
      console.log('[PASS] Test 7: Non-owner confirmUpload rejected with 403 Forbidden.');
    }

    // Test 8: confirmUpload succeeds for owner
    {
      const req: any = {
        user: { _id: ownerId, role: 'student' },
        params: { id: mockPrivateResource._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await confirmUpload(req, res);
      assert.strictEqual(statusCode, 200, 'Owner confirmUpload must succeed');
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(jsonPayload.data.status, 'processing');
      console.log('[PASS] Test 8: Owner confirmUpload succeeded.');
    }

    // Test 9: confirmUpload succeeds for admin
    {
      mockPrivateResource.status = 'uploading';
      const req: any = {
        user: { _id: adminId, role: 'admin' },
        params: { id: mockPrivateResource._id },
      };
      let statusCode = 200;
      let jsonPayload: any = null;
      const res: any = {
        status: (code: number) => { statusCode = code; return res; },
        json: (data: any) => { jsonPayload = data; return res; },
      };

      await confirmUpload(req, res);
      assert.strictEqual(statusCode, 200, 'Admin confirmUpload must succeed');
      assert.strictEqual(jsonPayload.success, true);
      assert.strictEqual(jsonPayload.data.status, 'processing');
      console.log('[PASS] Test 9: Admin confirmUpload succeeded.');
    }

    console.log('\nAll 9 Document Access Authorization tests PASSED successfully!\n');
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  } finally {
    (Resource as any).findById = originalFindById;
    (Resource as any).findByIdAndUpdate = originalFindByIdAndUpdate;
    (supabaseAdmin.storage as any).from = originalStorageFrom;
  }
}

runTests();
