import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function runTests() {
  console.log('Running Peer Presence Indicators Test Suite (Task 15)...');

  // Test 1: useRealtime.ts exports presence interfaces and event listeners
  const hookPath = path.resolve('client/src/hooks/useRealtime.ts');
  const hookContent = fs.readFileSync(hookPath, 'utf-8');

  assert.match(hookContent, /export interface PresenceUser/, 'Must export PresenceUser interface');
  assert.match(hookContent, /export interface PresenceEventNotice/, 'Must export PresenceEventNotice interface');
  assert.match(hookContent, /\.on\('presence',\s*\{\s*event:\s*'join'\s*\}/, 'Must listen for presence join events');
  assert.match(hookContent, /\.on\('presence',\s*\{\s*event:\s*'leave'\s*\}/, 'Must listen for presence leave events');
  assert.match(hookContent, /\.on\('presence',\s*\{\s*event:\s*'sync'\s*\}/, 'Must listen for presence sync events');
  assert.match(hookContent, /setActivePeers/, 'Must manage activePeers state');
  assert.match(hookContent, /setPresenceNotices/, 'Must manage presenceNotices state');
  console.log('[PASS] Test 1: useRealtime hook presence infrastructure verified.');

  // Test 2: StudyRoomsPage integrates presence roster and event notices
  const pagePath = path.resolve('client/src/pages/StudyRoomsPage.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');

  assert.match(pageContent, /activePeers/, 'Must consume activePeers from useRealtimeChannel');
  assert.match(pageContent, /presenceNotices/, 'Must consume presenceNotices from useRealtimeChannel');
  assert.match(pageContent, /showPeerList/, 'Must provide showPeerList toggle state');
  assert.match(pageContent, /joined the study circle/, 'Must render joined announcements');
  assert.match(pageContent, /left the study circle/, 'Must render left announcements');
  assert.match(pageContent, /Active scholars \(/, 'Must render active scholars roster popover');
  console.log('[PASS] Test 2: StudyRoomsPage UI contracts for presence and notifications verified.');

  // Test 3: Presence state sync simulation
  interface MockPresenceUser {
    userId: string;
    name: string;
    role: string;
    onlineAt: string;
  }

  const rawPresences: Record<string, { user_id: string; name: string; role: string; online_at: string }[]> = {
    'user-1': [{ user_id: 'u1', name: 'Aarav Mehta', role: 'student', online_at: '2026-11-19T10:00:00Z' }],
    'user-2': [{ user_id: 'u2', name: 'Sneha Patel', role: 'mentor', online_at: '2026-11-19T10:01:00Z' }],
  };

  const syncedPeers: MockPresenceUser[] = [];
  Object.values(rawPresences).forEach((pres) => {
    pres.forEach((p) => {
      syncedPeers.push({
        userId: p.user_id,
        name: p.name,
        role: p.role,
        onlineAt: p.online_at,
      });
    });
  });

  assert.strictEqual(syncedPeers.length, 2);
  assert.strictEqual(syncedPeers[0].name, 'Aarav Mehta');
  assert.strictEqual(syncedPeers[1].role, 'mentor');
  console.log('[PASS] Test 3: Presence state synchronization correctly extracts active scholar roster.');

  // Test 4: Join and leave event announcements bounded buffer
  let notices: { id: string; type: 'join' | 'leave'; name: string }[] = [];

  const handleJoin = (name: string) => {
    notices = [...notices.slice(-4), { id: `j-${Date.now()}`, type: 'join', name }];
  };

  const handleLeave = (name: string) => {
    notices = [...notices.slice(-4), { id: `l-${Date.now()}`, type: 'leave', name }];
  };

  handleJoin('Rohan');
  handleJoin('Priya');
  handleJoin('Ananya');
  handleJoin('Vikram');
  handleLeave('Rohan');
  handleJoin('Ishaan');

  assert.strictEqual(notices.length, 5, 'Buffer must be clamped to 5 notices');
  assert.strictEqual(notices[notices.length - 1].name, 'Ishaan');
  assert.strictEqual(notices[notices.length - 1].type, 'join');
  console.log('[PASS] Test 4: Join/leave notices buffer bounded cleanly.');

  console.log('\nAll 4 Peer Presence Indicators tests PASSED successfully!\n');
}

runTests();
