import assert from 'node:assert';
import { calculateSM2Review } from '../server/src/controllers/aiController';

async function runTests() {
  console.log('Running SuperMemo SM-2 Review Interval Scheduling Test Suite (Task 34)...');

  // Test 1: Boundary score q = 0 (complete blackout / lapse)
  {
    const baseDate = new Date('2026-11-20T12:00:00.000Z');
    // Initially rep = 3, interval = 15, EF = 2.5
    const result = calculateSM2Review(2.5, 3, 15, 0, baseDate);

    assert.strictEqual(result.repetition, 0, 'Repetition must reset to 0 upon lapse');
    assert.strictEqual(result.interval, 1, 'Interval must reset to 1 day upon lapse');
    assert.strictEqual(result.easeFactor, 1.7, 'EF should decrease to 1.7 when q = 0');

    const expectedDue = new Date('2026-11-21T12:00:00.000Z');
    assert.strictEqual(result.nextDueDate.toISOString(), expectedDue.toISOString(), 'Due date must be +1 day');
    console.log('[PASS] Test 1: Quality score q = 0 resets repetition and interval to 1 day, reducing EF.');
  }

  // Test 2: Quality score q = 5 (perfect recall)
  {
    const baseDate = new Date('2026-11-20T12:00:00.000Z');
    const result = calculateSM2Review(2.5, 0, 1, 5, baseDate);

    assert.strictEqual(result.repetition, 1, 'Repetition advances from 0 to 1');
    assert.strictEqual(result.interval, 1, 'First review interval is 1 day');
    assert.strictEqual(result.easeFactor, 2.6, 'EF increases from 2.5 to 2.6 on perfect recall');
    console.log('[PASS] Test 2: Perfect recall (q = 5) increases ease factor and schedules next review.');
  }

  // Test 3: Multi-step progression (Rep 0 -> Rep 1 -> Rep 2 -> Rep 3)
  {
    const baseDate = new Date('2026-11-20T12:00:00.000Z');

    // Step 1: initial review (q = 4)
    const step1 = calculateSM2Review(2.5, 0, 1, 4, baseDate);
    assert.strictEqual(step1.repetition, 1);
    assert.strictEqual(step1.interval, 1);
    assert.strictEqual(step1.easeFactor, 2.5);

    // Step 2: second review (q = 4)
    const step2 = calculateSM2Review(step1.easeFactor, step1.repetition, step1.interval, 4, baseDate);
    assert.strictEqual(step2.repetition, 2);
    assert.strictEqual(step2.interval, 6, 'Second successful interval is strictly 6 days');
    assert.strictEqual(step2.easeFactor, 2.5);

    // Step 3: third review (q = 4)
    const step3 = calculateSM2Review(step2.easeFactor, step2.repetition, step2.interval, 4, baseDate);
    assert.strictEqual(step3.repetition, 3);
    assert.strictEqual(step3.interval, 15, 'Third interval: Math.round(6 * 2.5) = 15 days');
    console.log('[PASS] Test 3: Multi-step progression advances 1 day -> 6 days -> 15 days.');
  }

  // Test 4: Ease factor floor clamping (EF >= 1.3)
  {
    let ef = 1.4;
    // Score 0 drops EF by 0.8
    const result = calculateSM2Review(ef, 1, 1, 0);
    assert.strictEqual(result.easeFactor, 1.3, 'EF must not drop below minimum floor 1.3');
    console.log('[PASS] Test 4: Ease factor strictly respects minimum floor threshold of 1.3.');
  }

  // Test 5: Quality score out-of-range clamping
  {
    const underScore = calculateSM2Review(2.5, 2, 6, -5); // should be clamped to 0
    assert.strictEqual(underScore.repetition, 0, 'Negative score clamped to 0 lapse');
    assert.strictEqual(underScore.easeFactor, 1.7);

    const overScore = calculateSM2Review(2.5, 0, 1, 99); // should be clamped to 5
    assert.strictEqual(overScore.easeFactor, 2.6, 'Score > 5 clamped to 5');
    console.log('[PASS] Test 5: Out-of-range quality inputs clamped cleanly to [0, 5].');
  }

  console.log('\nAll 5 SuperMemo SM-2 Review Interval Scheduling tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
