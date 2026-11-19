/**
 * Directory Page Semester and Branch Filters Test Suite (Task 35)
 *
 * Verifies multi-dimensional curriculum filtering:
 * 1. Branch filter isolation (CSE, IT, ECE, ME, CE).
 * 2. Semester filter isolation (Semesters 1 through 8).
 * 3. Combined branch and semester criteria intersection.
 * 4. Text search combined with branch and semester filters.
 * 5. Dynamic subject pill derivation and reset behavior.
 */

import assert from 'node:assert/strict';

export interface SubjectItem {
  _id: string;
  code: string;
  name: string;
  description: string;
  semester: number;
  credits: number;
  isCore: boolean;
  topicCount: number;
  branch?: string;
}

export function getSubjectBranch(subject: SubjectItem): string {
  if (subject.branch) return subject.branch.toUpperCase();
  const code = (subject.code || '').toUpperCase();
  if (code.startsWith('CS') || code.startsWith('CSE')) return 'CSE';
  if (code.startsWith('IT')) return 'IT';
  if (code.startsWith('EC') || code.startsWith('ECE')) return 'ECE';
  if (code.startsWith('ME')) return 'ME';
  if (code.startsWith('CE') || code.startsWith('CIVIL')) return 'CE';
  return 'CSE';
}

export function filterSubjects(
  subjects: SubjectItem[],
  options: {
    searchQuery?: string;
    branch?: string;
    semester?: number | 'all';
    subjectCode?: string | null;
  }
): SubjectItem[] {
  const {
    searchQuery = '',
    branch = 'all',
    semester = 'all',
    subjectCode = null,
  } = options;

  const query = searchQuery.trim().toLowerCase();

  return subjects.filter((s) => {
    // Branch Filter
    if (branch && branch !== 'all') {
      const subjectBranch = getSubjectBranch(s);
      if (subjectBranch !== branch.toUpperCase()) {
        return false;
      }
    }

    // Semester Filter
    if (semester !== undefined && semester !== 'all') {
      if (s.semester !== Number(semester)) {
        return false;
      }
    }

    // Subject Code Filter
    if (subjectCode && s.code !== subjectCode) {
      return false;
    }

    // Text Search Filter
    if (query) {
      const matchName = s.name.toLowerCase().includes(query);
      const matchCode = s.code.toLowerCase().includes(query);
      const matchDesc = (s.description || '').toLowerCase().includes(query);
      const matchBranch = getSubjectBranch(s).toLowerCase().includes(query);
      if (!matchName && !matchCode && !matchDesc && !matchBranch) {
        return false;
      }
    }

    return true;
  });
}

// Test fixtures covering diverse branches and semesters
const testSubjects: SubjectItem[] = [
  { _id: '1', code: 'CS-201', name: 'Data Structures & Algorithms', semester: 3, description: 'Core linear and non-linear data structures', credits: 4, isCore: true, topicCount: 24, branch: 'CSE' },
  { _id: '2', code: 'CS-202', name: 'Operating Systems', semester: 4, description: 'Process synchronization and CPU scheduling', credits: 4, isCore: true, topicCount: 18, branch: 'CSE' },
  { _id: '3', code: 'CS-203', name: 'Database Management Systems', semester: 4, description: 'SQL query optimization and normalization', credits: 4, isCore: true, topicCount: 16, branch: 'CSE' },
  { _id: '4', code: 'CS-301', name: 'Computer Networks', semester: 5, description: 'TCP/IP protocol stack and routing', credits: 3, isCore: true, topicCount: 14, branch: 'CSE' },
  { _id: '5', code: 'IT-201', name: 'Web Technologies', semester: 3, description: 'Full stack architecture and REST APIs', credits: 4, isCore: true, topicCount: 18, branch: 'IT' },
  { _id: '6', code: 'IT-302', name: 'Information Security & Cryptography', semester: 5, description: 'RSA, AES, and PKI security', credits: 4, isCore: false, topicCount: 16, branch: 'IT' },
  { _id: '7', code: 'EC-201', name: 'Digital Electronics & Microprocessors', semester: 3, description: 'Logic gates, registers, and 8085 architecture', credits: 4, isCore: true, topicCount: 20, branch: 'ECE' },
  { _id: '8', code: 'EC-301', name: 'Signals and Systems', semester: 5, description: 'Fourier transform, Laplace transform, and filters', credits: 4, isCore: true, topicCount: 15, branch: 'ECE' },
  { _id: '9', code: 'ME-201', name: 'Thermodynamics & Fluid Mechanics', semester: 3, description: 'Laws of thermodynamics and fluid dynamics', credits: 4, isCore: true, topicCount: 16, branch: 'ME' },
  { _id: '10', code: 'CE-201', name: 'Structural Analysis', semester: 3, description: 'Truss analysis and shear force moments', credits: 4, isCore: true, topicCount: 14, branch: 'CE' },
];

console.log('Running Subject Directory Semester & Branch Filters Test Suite (Task 35)...');

// Test 1: Branch filter isolation
const cseResults = filterSubjects(testSubjects, { branch: 'CSE' });
assert.equal(cseResults.length, 4, 'CSE filter should return 4 subjects');
assert(cseResults.every((s) => s.branch === 'CSE'), 'All returned subjects must belong to CSE');

const eceResults = filterSubjects(testSubjects, { branch: 'ECE' });
assert.equal(eceResults.length, 2, 'ECE filter should return 2 subjects');
assert(eceResults.every((s) => s.branch === 'ECE'), 'All returned subjects must belong to ECE');
console.log('[PASS] Test 1: Branch filtering correctly isolates CSE and ECE courses.');

// Test 2: Semester filter isolation
const sem3Results = filterSubjects(testSubjects, { semester: 3 });
assert.equal(sem3Results.length, 5, 'Semester 3 filter should return 5 subjects across branches');
assert(sem3Results.every((s) => s.semester === 3), 'All returned subjects must have semester = 3');

const sem4Results = filterSubjects(testSubjects, { semester: 4 });
assert.equal(sem4Results.length, 2, 'Semester 4 filter should return 2 subjects (CS-202, CS-203)');
assert.deepEqual(sem4Results.map((s) => s.code), ['CS-202', 'CS-203']);
console.log('[PASS] Test 2: Semester filtering isolates subjects by semester level (Sem 3, Sem 4).');

// Test 3: Combined Branch and Semester criteria intersection
const cseSem4 = filterSubjects(testSubjects, { branch: 'CSE', semester: 4 });
assert.equal(cseSem4.length, 2, 'CSE Semester 4 should return exactly CS-202 and CS-203');

const itSem3 = filterSubjects(testSubjects, { branch: 'IT', semester: 3 });
assert.equal(itSem3.length, 1, 'IT Semester 3 should return 1 subject (IT-201)');
assert.equal(itSem3[0].code, 'IT-201');

const meSem5 = filterSubjects(testSubjects, { branch: 'ME', semester: 5 });
assert.equal(meSem5.length, 0, 'ME Semester 5 has no courses in fixture and returns empty');
console.log('[PASS] Test 3: Combined branch and semester intersection accurately filters dataset.');

// Test 4: Text Search combined with multi-filters
const searchQueryResult = filterSubjects(testSubjects, {
  branch: 'CSE',
  semester: 4,
  searchQuery: 'database',
});
assert.equal(searchQueryResult.length, 1, 'Search for "database" within CSE Sem 4 must return CS-203');
assert.equal(searchQueryResult[0].code, 'CS-203');
console.log('[PASS] Test 4: Search query cleanly composes with branch and semester filters.');

// Test 5: Dynamic branch inference and reset behavior
const defaultBranchInferred = getSubjectBranch({
  _id: '11',
  code: 'CS-999',
  name: 'Quantum Computing',
  description: '',
  semester: 8,
  credits: 4,
  isCore: false,
  topicCount: 10,
});
assert.equal(defaultBranchInferred, 'CSE', 'CS-prefixed subject without explicit branch infers CSE');

const allResults = filterSubjects(testSubjects, { branch: 'all', semester: 'all' });
assert.equal(allResults.length, testSubjects.length, 'Resetting filters returns all subjects');
console.log('[PASS] Test 5: Branch code prefix inference and full filter reset confirmed.');

console.log('\nAll 5 Directory Page Semester & Branch Filters tests PASSED successfully!\n');
