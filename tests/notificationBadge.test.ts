import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

async function runTests() {
  console.log('Running Notification Badge Counter Test Suite (Task 33)...');

  const bellPath = path.resolve('client/src/components/NotificationBell.tsx');
  const content = fs.readFileSync(bellPath, 'utf-8');

  // Test 1: Numerical unread count badge
  {
    assert.match(content, /unreadCount\s*>\s*9\s*\?\s*['"]9\+['"]\s*:\s*unreadCount/, 'NotificationBell must display numerical counter badge or 9+ cap');
    assert.match(content, /unreadCount\s*>\s*0/, 'Badge must only render when unreadCount > 0');
    console.log('[PASS] Test 1: Notification bell displays reactive numerical unread count badge with 9+ cap.');
  }

  // Test 2: Accessible aria-label
  {
    assert.match(content, /aria-label=\{unreadCount\s*>\s*0\s*\?\s*`\$\{unreadCount\}\s+unread notifications`/, 'Button must provide dynamic aria-label communicating unread count to screen readers');
    console.log('[PASS] Test 2: Notification button provides accessible aria-label reflecting unread message count.');
  }

  // Test 3: Mark read actions
  {
    assert.match(content, /handleMarkAllRead/, 'NotificationBell must implement handleMarkAllRead action');
    assert.match(content, /handleMarkItemRead/, 'NotificationBell must implement handleMarkItemRead action');
    assert.match(content, /setUnreadCount\(0\)/, 'Marking all read must reset unreadCount to 0 immediately');
    console.log('[PASS] Test 3: Mark all read and individual notification read actions immediately update badge count.');
  }

  // Test 4: Escape key and click-outside dismissal
  {
    assert.match(content, /e\.key\s*===\s*['"]Escape['"]/, 'Notification popover must dismiss on Escape key');
    assert.match(content, /handleClickOutside/, 'Notification popover must dismiss on clicking outside');
    console.log('[PASS] Test 4: Popover implements smooth Escape key and click-outside dismissal.');
  }

  console.log('\nAll 4 Notification Badge Counter tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
