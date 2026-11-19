import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  getSyllabusCoverage,
  calculateCoverageMetrics,
} from '../server/src/controllers/analyticsController';
import { Subject } from '../server/src/models/Academic';

async function runTests() {
  console.log('Running Accurate Coverage Metrics Test Suite (Task 19)...');

  // Test 1: Subject not found returns 404
  {
    let statusCode = 200;
    let responsePayload: any = null;
    const fakeId = new mongoose.Types.ObjectId();
    const mockReq: any = { params: { subjectId: fakeId.toString() } };
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

    await getSyllabusCoverage(mockReq, mockRes);
    assert.strictEqual(statusCode, 404, 'Non-existent subject must return 404');
    assert.strictEqual(responsePayload.success, false, 'Payload must indicate success: false');
    console.log('[PASS] Test 1: Non-existent subject returns clean 404 response.');
  }

  // Test 2: calculateCoverageMetrics handles 0 units and 0 resources gracefully
  {
    const emptyResult = calculateCoverageMetrics({
      unitsCount: 0,
      topicsCount: 0,
      resources: [],
    });
    assert.strictEqual(emptyResult.coveragePercentage, 0, 'Zero units and resources must yield 0% coverage');
    assert.strictEqual(emptyResult.status, 'Uncovered', 'Zero coverage status must be Uncovered');
    assert.ok(
      emptyResult.gaps.includes('No syllabus units defined for this subject'),
      'Must record unit gap'
    );
    console.log('[PASS] Test 2: Zero units and resources correctly yields 0% coverage and Uncovered status.');
  }

  // Test 3: Complete curriculum resources yield 100% Comprehensive coverage
  {
    const fullResult = calculateCoverageMetrics({
      unitsCount: 5,
      topicsCount: 20,
      resources: [
        { resourceType: 'syllabus' },
        { resourceType: 'lecture_notes', topicIds: Array.from({ length: 20 }, (_, i) => `t-${i}`) },
        { resourceType: 'question_paper' },
        { resourceType: 'lab_manual' },
      ],
    });
    assert.strictEqual(fullResult.coveragePercentage, 100, 'All curriculum assets must yield 100% coverage');
    assert.strictEqual(fullResult.status, 'Comprehensive', '100% coverage must yield Comprehensive status');
    assert.strictEqual(fullResult.hasSyllabusCopy, true);
    assert.strictEqual(fullResult.hasNotes, true);
    assert.strictEqual(fullResult.hasPapers, true);
    console.log('[PASS] Test 3: Complete curriculum resources yield 100% Comprehensive coverage.');
  }

  // Test 4: Missing papers accurately diagnosed in status and gaps array
  {
    const partialResult = calculateCoverageMetrics({
      unitsCount: 4,
      topicsCount: 10,
      resources: [
        { resourceType: 'syllabus' },
        { resourceType: 'lecture_notes', topicIds: ['t-1', 't-2', 't-3', 't-4', 't-5', 't-6', 't-7', 't-8', 't-9', 't-10'] },
      ],
    });
    assert.strictEqual(partialResult.status, 'Needs Question Papers', 'Missing papers should flag Needs Question Papers');
    assert.ok(partialResult.gaps.includes('Missing previous year question papers'));
    console.log('[PASS] Test 4: Missing papers accurately diagnosed in status and gaps array.');
  }

  // Test 5: Verify calculateCoverageMetrics handles zero topics without division by zero error
  {
    const zeroTopicsResult = calculateCoverageMetrics({
      unitsCount: 5,
      topicsCount: 0,
      resources: [
        { resourceType: 'syllabus' },
        { resourceType: 'lecture_notes' },
      ],
    });
    assert.ok(zeroTopicsResult.coveragePercentage > 0, 'Should estimate coverage based on unit density');
    assert.ok(
      zeroTopicsResult.gaps.includes('No detailed curriculum topics mapped to units'),
      'Should report zero-topics gap'
    );
    console.log('[PASS] Test 5: Zero-topics condition handled gracefully without division-by-zero.');
  }

  console.log('\nAll 5 Accurate Coverage Metrics tests PASSED successfully!\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
