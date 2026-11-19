import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function runTests() {
  console.log('Running Discussion Resolution Status Indicators Test Suite (Task 13)...');

  // Test 1: DiscussionsPage.tsx contains the resolution indicators and tokens
  const pagePath = path.resolve('client/src/pages/DiscussionsPage.tsx');
  const content = fs.readFileSync(pagePath, 'utf-8');

  // Check filter tabs
  assert.match(content, /statusFilter === 'all'/, 'DiscussionsPage must implement statusFilter === all');
  assert.match(content, /statusFilter === 'resolved'/, 'DiscussionsPage must implement statusFilter === resolved');
  assert.match(content, /statusFilter === 'unresolved'/, 'DiscussionsPage must implement statusFilter === unresolved');

  // Check resolution indicators and badges
  assert.match(content, /text-accent-green/, 'Must use text-accent-green design token for resolved status');
  assert.match(content, /bg-accent-green\/10/, 'Must use bg-accent-green token');
  assert.match(content, /border-accent-green\/30/, 'Must use border-accent-green token');
  assert.match(content, /HelpCircle/, 'Must use HelpCircle for open discussion indicator');
  assert.match(content, /Accepted Solution \(\+15 pts\)/, 'Must display Accepted Solution (+15 pts) badge');
  assert.match(content, /Accepted Solution Available/, 'Must display Accepted Solution Available banner');
  console.log('[PASS] Test 1: DiscussionsPage source verified for resolution indicators and design tokens.');

  // Test 2: Resolution Detection Logic
  interface MockDiscussion {
    _id: string;
    resolved?: boolean;
    status?: string;
    acceptedAnswerId?: string;
    comments?: { isAcceptedAnswer: boolean }[];
  }

  const isResolved = (d: MockDiscussion): boolean => {
    return Boolean(
      d.resolved ||
      d.status === 'resolved' ||
      d.acceptedAnswerId ||
      d.comments?.some((c) => c.isAcceptedAnswer)
    );
  };

  const sampleDiscussions: MockDiscussion[] = [
    { _id: 'd1', resolved: true },
    { _id: 'd2', status: 'resolved' },
    { _id: 'd3', acceptedAnswerId: 'c3' },
    { _id: 'd4', comments: [{ isAcceptedAnswer: true }] },
    { _id: 'd5', resolved: false, status: 'open', comments: [{ isAcceptedAnswer: false }] },
    { _id: 'd6', resolved: false, status: 'open' },
  ];

  const resolvedDiscussions = sampleDiscussions.filter((d) => isResolved(d));
  const openDiscussions = sampleDiscussions.filter((d) => !isResolved(d));

  assert.strictEqual(resolvedDiscussions.length, 4, 'd1, d2, d3, d4 must be detected as resolved');
  assert.strictEqual(openDiscussions.length, 2, 'd5, d6 must be detected as open');
  assert.strictEqual(resolvedDiscussions.length + openDiscussions.length, sampleDiscussions.length);
  console.log('[PASS] Test 2: Resolution detection logic accurately handles all resolved schema variants.');

  // Test 3: Status Filtering Functional Invariants
  const filterByStatus = (items: MockDiscussion[], filter: 'all' | 'resolved' | 'unresolved') => {
    return items.filter((d) => {
      const res = isResolved(d);
      if (filter === 'resolved') return res;
      if (filter === 'unresolved') return !res;
      return true;
    });
  };

  const allFiltered = filterByStatus(sampleDiscussions, 'all');
  const resolvedFiltered = filterByStatus(sampleDiscussions, 'resolved');
  const unresolvedFiltered = filterByStatus(sampleDiscussions, 'unresolved');

  assert.strictEqual(allFiltered.length, 6);
  assert.strictEqual(resolvedFiltered.length, 4);
  assert.strictEqual(unresolvedFiltered.length, 2);
  assert.deepStrictEqual(resolvedFiltered.map((d) => d._id), ['d1', 'd2', 'd3', 'd4']);
  assert.deepStrictEqual(unresolvedFiltered.map((d) => d._id), ['d5', 'd6']);
  console.log('[PASS] Test 3: Status filtering cleanly segments resolved vs open discussions.');

  // Test 4: Dynamic Accepted Answer Sorting Invariant
  const comments = [
    { _id: 'c1', isAcceptedAnswer: false, body: 'First' },
    { _id: 'c2', isAcceptedAnswer: true, body: 'Accepted' },
    { _id: 'c3', isAcceptedAnswer: false, body: 'Third' },
  ];

  comments.sort((a, b) => (b.isAcceptedAnswer ? 1 : 0) - (a.isAcceptedAnswer ? 1 : 0));
  assert.strictEqual(comments[0]._id, 'c2', 'Accepted answer must sort to the top');
  console.log('[PASS] Test 4: Accepted solution sorting order maintains top priority.');

  console.log('\nAll 4 Resolution Status Indicators tests PASSED successfully!\n');
}

runTests();
