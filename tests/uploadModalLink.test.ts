/**
 * Upload Modal Linking & Pre-Population Test Suite (Task 36)
 *
 * Verifies that the UploadModal correctly accepts and pre-populates
 * subject context when opened from Subject Cards or the Details Drawer.
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
}

export interface UploadFormState {
  isManualSubject: boolean;
  selectedSubjectId: string;
  manualSubjectName: string;
  manualSubjectCode: string;
}

export function computeInitialUploadState(
  subjects: SubjectItem[],
  initialSubject?: SubjectItem | null
): UploadFormState {
  if (!initialSubject) {
    return {
      isManualSubject: true,
      selectedSubjectId: subjects[0]?._id || '',
      manualSubjectName: '',
      manualSubjectCode: '',
    };
  }

  const matchingSubject = subjects.find(
    (s) =>
      (s._id && s._id === initialSubject._id) ||
      (s.code && s.code.toUpperCase() === (initialSubject.code || '').toUpperCase())
  );

  if (matchingSubject) {
    return {
      isManualSubject: false,
      selectedSubjectId: matchingSubject._id,
      manualSubjectName: matchingSubject.name,
      manualSubjectCode: matchingSubject.code,
    };
  }

  return {
    isManualSubject: true,
    selectedSubjectId: subjects[0]?._id || '',
    manualSubjectName: initialSubject.name || '',
    manualSubjectCode: initialSubject.code || '',
  };
}

const mockSubjects: SubjectItem[] = [
  { _id: 'sub-1', code: 'CS-201', name: 'Data Structures & Algorithms', semester: 3, credits: 4, isCore: true, topicCount: 24, description: 'Core DSA' },
  { _id: 'sub-2', code: 'CS-202', name: 'Operating Systems', semester: 4, credits: 4, isCore: true, topicCount: 18, description: 'Core OS' },
  { _id: 'sub-3', code: 'CS-301', name: 'Computer Networks', semester: 5, credits: 3, isCore: true, topicCount: 14, description: 'Core Networks' },
];

console.log('Running Upload Modal Linking & Pre-Population Test Suite (Task 36)...');

// Test 1: Default state without initial subject
const defaultState = computeInitialUploadState(mockSubjects);
assert.equal(defaultState.isManualSubject, true, 'Default state should allow manual input or dropdown selection');
assert.equal(defaultState.selectedSubjectId, 'sub-1', 'Default selected ID should default to first subject');
assert.equal(defaultState.manualSubjectName, '', 'Default manual name is empty');
assert.equal(defaultState.manualSubjectCode, '', 'Default manual code is empty');
console.log('[PASS] Test 1: Default upload state initializes safely with fallback ID.');

// Test 2: Matching subject from Subject Directory card
const dsaCard = mockSubjects[0];
const dsaState = computeInitialUploadState(mockSubjects, dsaCard);
assert.equal(dsaState.isManualSubject, false, 'Matching catalog subject selects dropdown mode (isManualSubject: false)');
assert.equal(dsaState.selectedSubjectId, 'sub-1', 'Selected subject ID matches CS-201');
assert.equal(dsaState.manualSubjectCode, 'CS-201', 'Subject code is stored');
console.log('[PASS] Test 2: Catalog subject pre-selects dropdown mode and matching subject ID.');

// Test 3: Matching subject by uppercase course code
const codeOnlySubject: SubjectItem = {
  _id: 'temp-id',
  code: 'cs-202',
  name: 'Operating Systems',
  semester: 4,
  credits: 4,
  isCore: true,
  topicCount: 18,
  description: '',
};
const codeMatchState = computeInitialUploadState(mockSubjects, codeOnlySubject);
assert.equal(codeMatchState.isManualSubject, false, 'Matches regardless of case in course code');
assert.equal(codeMatchState.selectedSubjectId, 'sub-2', 'Resolves to sub-2 for CS-202');
console.log('[PASS] Test 3: Case-insensitive course code matching resolves catalog subject.');

// Test 4: Custom non-catalog subject pre-fills manual fields
const customSubject: SubjectItem = {
  _id: 'custom-99',
  code: 'BIO-101',
  name: 'Biomedical Informatics',
  semester: 2,
  credits: 3,
  isCore: false,
  topicCount: 10,
  description: '',
};
const customState = computeInitialUploadState(mockSubjects, customSubject);
assert.equal(customState.isManualSubject, true, 'Non-catalog subject defaults to manual mode');
assert.equal(customState.manualSubjectName, 'Biomedical Informatics', 'Manual subject name is pre-populated');
assert.equal(customState.manualSubjectCode, 'BIO-101', 'Manual subject code is pre-populated');
console.log('[PASS] Test 4: Non-catalog subject pre-populates manual input fields.');

console.log('\nAll 4 Upload Modal Linking & Pre-Population tests PASSED successfully!\n');
