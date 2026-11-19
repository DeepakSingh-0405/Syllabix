import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import { escapeRegex } from '../server/src/utils/sanitize';
import { getSubjects } from '../server/src/controllers/academicController';
import { getResources } from '../server/src/controllers/resourceController';
import { Subject } from '../server/src/models/Academic';
import { Resource } from '../server/src/models/Resource';

async function runTests() {
  console.log('Running Search Input Sanitization & Regex Safety Test Suite...');

  // Test 1: escapeRegex escapes all special characters
  {
    const input = '.*+?^${}()|[]\\';
    const escaped = escapeRegex(input);
    assert.strictEqual(escaped, '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    
    // Verifying it compiles as a valid literal RegExp without throwing
    const re = new RegExp(escaped);
    assert.ok(re.test(input), 'Must match the literal string');
    assert.ok(!re.test('other'), 'Must not match random string');
    console.log('[PASS] Test 1: All 12 regex metacharacters properly escaped.');
  }

  // Test 2: escapeRegex handles edge cases and non-string inputs
  {
    assert.strictEqual(escapeRegex(null), '');
    assert.strictEqual(escapeRegex(undefined), '');
    assert.strictEqual(escapeRegex(12345 as any), '');
    assert.strictEqual(escapeRegex({} as any), '');
    assert.strictEqual(escapeRegex(''), '');
    console.log('[PASS] Test 2: Non-string and empty inputs safely resolved.');
  }

  // Test 3: Malicious ReDoS attack payloads do not throw or trigger regex wildcards
  {
    const maliciousInputs = [
      '(([a-z])+)+$',
      '(a|aa)+',
      '[*unclosed',
      '(?<=unsupported',
      'C++',
      'OS/2 (x86)',
      'Algorithms [2024-2025]',
    ];

    for (const raw of maliciousInputs) {
      const sanitized = escapeRegex(raw);
      // Ensure creating a RegExp with sanitized string NEVER throws SyntaxError
      assert.doesNotThrow(() => {
        const re = new RegExp(sanitized, 'i');
        assert.ok(re.test(raw));
      }, `Sanitized string for "${raw}" must compile safely`);
    }
    console.log('[PASS] Test 3: Complex ReDoS and invalid syntax patterns compiled safely.');
  }

  // Test 4: getSubjects with unescaped regex search input
  {
    let capturedFilter: any = null;
    const originalFind = Subject.find;
    (Subject as any).find = (filter: any) => {
      capturedFilter = filter;
      return { lean: async () => [{ name: 'C++ Programming', code: 'CS-204' }] };
    };

    const req: any = { query: { search: 'C++ (Advanced)' } };
    let jsonPayload: any = null;
    const res: any = {
      json: (data: any) => { jsonPayload = data; return res; },
      status: () => res,
    };

    await getSubjects(req, res);
    assert.strictEqual(jsonPayload.success, true);
    assert.ok(capturedFilter.$or);
    assert.strictEqual(capturedFilter.$or[0].name.$regex, 'C\\+\\+ \\(Advanced\\)');
    assert.strictEqual(capturedFilter.$or[1].code.$regex, 'C\\+\\+ \\(Advanced\\)');
    console.log('[PASS] Test 4: getSubjects sanitized regex in query filter.');
    (Subject as any).find = originalFind;
  }

  // Test 5: getResources with brackets and special characters
  {
    let capturedFilter: any = null;
    const originalFind = Resource.find;
    const originalCount = Resource.countDocuments;
    (Resource as any).find = (filter: any) => {
      capturedFilter = filter;
      return {
        populate: () => ({
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => [],
                }),
              }),
            }),
          }),
        }),
      };
    };
    (Resource as any).countDocuments = async () => 0;

    const req: any = { query: { search: '[Unit 1] Algorithms & Data Structures (CS-201)*' } };
    let jsonPayload: any = null;
    const res: any = {
      json: (data: any) => { jsonPayload = data; return res; },
      status: () => res,
    };

    await getResources(req, res);
    assert.strictEqual(jsonPayload.success, true);
    assert.ok(capturedFilter.$or);
    assert.strictEqual(
      capturedFilter.$or[0].title.$regex,
      '\\[Unit 1\\] Algorithms & Data Structures \\(CS-201\\)\\*'
    );
    console.log('[PASS] Test 5: getResources sanitized regex in query filter.');
    (Resource as any).find = originalFind;
    (Resource as any).countDocuments = originalCount;
  }

  console.log('\nAll 5 Search Input Sanitization & Regex Safety tests PASSED successfully!\n');
}

runTests();
