import assert from 'node:assert';
import { createRequire } from 'node:module';
import path from 'node:path';

const serverRequire = createRequire(path.resolve('server/package.json'));
const mongoose = serverRequire('mongoose');
mongoose.set('bufferCommands', false);

import {
  assignLeaderboardRanks,
  getLeaderboard,
} from '../server/src/controllers/analyticsController';

async function runTests() {
  console.log('Running Normalized Leaderboard Ranking Test Suite (Task 20)...');

  // Test 1: Standard 1-based sequential ranking for distinct points
  {
    const users = [
      { _id: 'u1', name: 'Alice', reputationPoints: 100 },
      { _id: 'u2', name: 'Bob', reputationPoints: 80 },
      { _id: 'u3', name: 'Charlie', reputationPoints: 50 },
    ];
    const ranked = assignLeaderboardRanks(users);
    assert.strictEqual(ranked.length, 3);
    assert.strictEqual(ranked[0].rank, 1, 'First user must have rank 1');
    assert.strictEqual(ranked[1].rank, 2, 'Second user must have rank 2');
    assert.strictEqual(ranked[2].rank, 3, 'Third user must have rank 3');
    console.log('[PASS] Test 1: Distinct points assign clean 1-based sequential ranks.');
  }

  // Test 2: Consistent tie handling
  {
    const users = [
      { _id: 'u1', name: 'Alice', reputationPoints: 100 },
      { _id: 'u2', name: 'Bob', reputationPoints: 100 },
      { _id: 'u3', name: 'Charlie', reputationPoints: 60 },
      { _id: 'u4', name: 'David', reputationPoints: 60 },
      { _id: 'u5', name: 'Eve', reputationPoints: 20 },
    ];
    const ranked = assignLeaderboardRanks(users);
    assert.strictEqual(ranked[0].rank, 1, 'Alice is rank 1');
    assert.strictEqual(ranked[1].rank, 1, 'Bob is tied with Alice at rank 1');
    assert.strictEqual(ranked[2].rank, 3, 'Charlie takes rank 3');
    assert.strictEqual(ranked[3].rank, 3, 'David is tied with Charlie at rank 3');
    assert.strictEqual(ranked[4].rank, 5, 'Eve takes rank 5');
    console.log('[PASS] Test 2: Tied reputation scores receive identical rank with competition offset.');
  }

  // Test 3: Badges and tiers correctly assigned
  {
    const users = [
      { _id: 'u1', name: 'Pioneer', reputationPoints: 200 },
      { _id: 'u2', name: 'Mentor', reputationPoints: 100 },
      { _id: 'u3', name: 'Solver', reputationPoints: 40 },
      { _id: 'u4', name: 'Novice', reputationPoints: 10 },
    ];
    const ranked = assignLeaderboardRanks(users);
    assert.strictEqual(ranked[0].badge, 'Curriculum Pioneer');
    assert.strictEqual(ranked[0].tier, 'diamond');
    assert.strictEqual(ranked[1].badge, 'Senior Mentor');
    assert.strictEqual(ranked[1].tier, 'gold');
    assert.strictEqual(ranked[2].badge, 'Doubt Solver');
    assert.strictEqual(ranked[2].tier, 'silver');
    assert.strictEqual(ranked[3].badge, 'Novice Scholar');
    assert.strictEqual(ranked[3].tier, 'bronze');
    console.log('[PASS] Test 3: Badges and achievement tiers accurately awarded.');
  }

  // Test 4: Stable sorting order even when input is unsorted
  {
    const unsortedUsers = [
      { _id: 'u3', name: 'Low', reputationPoints: 20 },
      { _id: 'u1', name: 'High', reputationPoints: 150 },
      { _id: 'u2', name: 'Mid', reputationPoints: 90 },
    ];
    const ranked = assignLeaderboardRanks(unsortedUsers);
    assert.strictEqual(ranked[0].name, 'High');
    assert.strictEqual(ranked[0].rank, 1);
    assert.strictEqual(ranked[1].name, 'Mid');
    assert.strictEqual(ranked[1].rank, 2);
    assert.strictEqual(ranked[2].name, 'Low');
    assert.strictEqual(ranked[2].rank, 3);
    console.log('[PASS] Test 4: Leaderboard sorting guarantees deterministic descending order.');
  }

  // Test 5: getLeaderboard controller returns 200 with { success: true, data: [...] }
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

    await getLeaderboard(mockReq, mockRes);
    assert.strictEqual(responsePayload.success, true);
    assert.ok(Array.isArray(responsePayload.data));
    assert.ok(responsePayload.data.length > 0);
    assert.strictEqual(responsePayload.data[0].rank, 1);
    console.log('[PASS] Test 5: getLeaderboard controller output satisfies API contract.');
  }

  console.log('\nAll 5 Normalized Leaderboard Ranking tests PASSED successfully!\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
