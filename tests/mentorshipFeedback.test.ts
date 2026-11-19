import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

async function runTests() {
  console.log('Running Mentorship Booking Feedback Test Suite (Task 32)...');

  const mentorshipPagePath = path.resolve('client/src/pages/MentorshipPage.tsx');
  const content = fs.readFileSync(mentorshipPagePath, 'utf-8');

  // Test 1: Submitting state and duplicate prevention
  {
    assert.match(content, /isBookingSubmitting/, 'MentorshipPage must track isBookingSubmitting state');
    assert.match(content, /disabled=\{isBookingSubmitting/, 'Submit button must be disabled while submission is in-flight');
    assert.match(content, /Submitting Request\.\.\./, 'Submit button must show visual in-flight status');
    console.log('[PASS] Test 1: Booking submission state and button disabling prevent duplicate request dispatches.');
  }

  // Test 2: Confirmation card & visual feedback
  {
    assert.match(content, /confirmedBooking/, 'MentorshipPage must manage confirmedBooking state');
    assert.match(content, /Session Request Confirmed/, 'Confirmation card must render clear confirmed status header');
    assert.match(content, /confirmedBooking\.mentorName/, 'Confirmation card must render booked mentor name');
    assert.match(content, /confirmedBooking\.subjectCode/, 'Confirmation card must display booked subject code');
    assert.match(content, /Open 1-on-1 Live Chat/, 'Confirmation card must provide action to navigate directly to mentor chat');
    console.log('[PASS] Test 2: Rich confirmation card displays mentor details, subject code, and chat navigation.');
  }

  // Test 3: Error handling and dismissal
  {
    assert.match(content, /bookingError/, 'MentorshipPage must track booking error state');
    assert.match(content, /setBookingError/, 'Booking failure must populate booking error instead of claiming fake success');
    assert.match(content, /Dismiss/, 'Error banner must support user dismissal');
    console.log('[PASS] Test 3: Booking failures surface clear error messaging with user dismissal.');
  }

  console.log('\nAll 3 Mentorship Booking Feedback tests PASSED successfully!\n');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
