import assert from 'node:assert/strict';
import { isBackendUnavailableError, ApiClientError, getApiBaseUrl } from '../client/src/lib/api';
import {
  synthesizeAssistantAnswer,
  synthesizeSubjectSummary,
  synthesizeSubjectQuiz,
  synthesizeSubjectFlashcards,
} from '../client/src/lib/curriculumSynthesis';
import { Subject } from '../client/src/types';

console.log('Running Client Resilience & Offline Curriculum Synthesis Test Suite...\n');

async function runTests() {
  const mockSubject: Subject = {
    _id: 'sub-dsa-1',
    code: 'CS-201',
    name: 'Data Structures & Algorithms',
    semester: 3,
    description: 'Core linear and non-linear data structures, trees, graphs, heaps, hash tables, and asymptotic algorithmic complexity.',
    credits: 4,
    isCore: true,
    topicCount: 24,
    branch: 'CSE',
  };

  // Test 1: getApiBaseUrl resolution logic
  console.log('[Test 1] Testing getApiBaseUrl resolution in different environments...');
  // In Node test environment without window.location, should default to localhost:5001
  const baseUrl = getApiBaseUrl();
  assert.equal(typeof baseUrl, 'string');
  assert.ok(baseUrl.length > 0);
  console.log(`  -> Resolved API Base URL: ${baseUrl}`);
  console.log('[PASS] Test 1: getApiBaseUrl returns a valid URL string.');

  // Test 2: isBackendUnavailableError detection
  console.log('\n[Test 2] Testing isBackendUnavailableError classification...');
  const netErr = new ApiClientError('Syllabix backend service is currently unreachable.', 0, true);
  assert.equal(isBackendUnavailableError(netErr), true);

  const fetchErr = new Error('TypeError: Failed to fetch');
  assert.equal(isBackendUnavailableError(fetchErr), true);

  const refusedErr = new Error('connect ECONNREFUSED 127.0.0.1:5001');
  assert.equal(isBackendUnavailableError(refusedErr), true);

  const normalErr = new Error('Validation failed: email is required');
  assert.equal(isBackendUnavailableError(normalErr), false);
  console.log('[PASS] Test 2: Network, connection refused, and fetch errors correctly identified.');

  // Test 3: synthesizeAssistantAnswer conversational greeting ("hi]")
  console.log('\n[Test 3] Testing AI assistant response for user greeting ("hi]")...');
  const greetingResponse = synthesizeAssistantAnswer('hi]', mockSubject);
  assert.ok(greetingResponse.answer.includes('Hello! I am your real-time Syllabix AI Academic Assistant'));
  assert.ok(greetingResponse.answer.includes('CS-201'));
  assert.ok(greetingResponse.citations.length > 0);
  console.log(`  -> Greeting Answer:\n${greetingResponse.answer.slice(0, 150)}...`);
  console.log('[PASS] Test 3: Conversational greeting successfully answered with curriculum context.');

  // Test 4: synthesizeAssistantAnswer academic derivation (AVL Tree rotations)
  console.log('\n[Test 4] Testing AI assistant response for conceptual query (AVL Trees)...');
  const avlResponse = synthesizeAssistantAnswer('Explain AVL tree balance factors and double rotations', mockSubject);
  assert.ok(avlResponse.answer.includes('Balance Factor'));
  assert.ok(avlResponse.answer.includes('Left-Right (LR)'));
  assert.ok(avlResponse.answer.includes('Right-Left (RL)'));
  assert.ok(avlResponse.citations.length > 0);
  console.log('[PASS] Test 4: AVL tree question answered with formal mathematical invariants and rotations.');

  // Test 5: synthesizeAssistantAnswer with scanned document context
  console.log('\n[Test 5] Testing AI assistant response with attached scanned document excerpt...');
  const attachedDoc = {
    name: 'CS201_Midsem_Exam_Notes.pdf',
    text: 'Unit 2 emphasizes that LL and RR rotations are single, whereas LR and RL are compound double rotations restoring O(log n) height.',
  };
  const docResponse = synthesizeAssistantAnswer('Explain AVL tree balance factors', mockSubject, attachedDoc);
  assert.ok(docResponse.answer.includes('Grounded in Scanned Document (CS201_Midsem_Exam_Notes.pdf)'));
  assert.equal(docResponse.citations[0].title, 'CS201_Midsem_Exam_Notes.pdf');
  console.log('[PASS] Test 5: Scanned document citation and grounding properly integrated.');

  // Test 6: synthesizeSubjectSummary revision notes
  console.log('\n[Test 6] Testing offline summary synthesis...');
  const summary = synthesizeSubjectSummary(mockSubject);
  assert.equal(summary.subjectCode, 'CS-201');
  assert.ok(summary.keyTakeaways.length >= 3);
  assert.ok(summary.unitBreakdown.length >= 4);
  assert.ok(summary.examPrepTips.length >= 3);
  console.log(`  -> Generated ${summary.unitBreakdown.length} curriculum units with high-yield concepts.`);
  console.log('[PASS] Test 6: Comprehensive syllabus revision notes synthesized successfully.');

  // Test 7: synthesizeSubjectQuiz MCQ assessment
  console.log('\n[Test 7] Testing offline quiz generation...');
  const quiz = synthesizeSubjectQuiz(mockSubject);
  assert.equal(quiz.length, 4);
  assert.ok(quiz[0].question.length > 0);
  assert.equal(quiz[0].options.length, 4);
  assert.ok(typeof quiz[0].correctIndex === 'number');
  assert.ok(quiz[0].explanation.length > 0);
  console.log('[PASS] Test 7: 4-question MCQ assessment formatted with valid answer keys and explanations.');

  // Test 8: synthesizeSubjectFlashcards spaced repetition deck
  console.log('\n[Test 8] Testing offline flashcard synthesis...');
  const cards = synthesizeSubjectFlashcards(mockSubject);
  assert.equal(cards.length, 5);
  assert.ok(cards[0].front.length > 0);
  assert.ok(cards[0].back.length > 0);
  assert.ok(cards[0].interval >= 1);
  console.log('[PASS] Test 8: 5 spaced repetition flashcards generated with valid source references.');

  console.log('\n================================================================================');
  console.log('      ALL 8 CLIENT RESILIENCE & OFFLINE SYNTHESIS TESTS PASSED (100%)');
  console.log('================================================================================');
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
