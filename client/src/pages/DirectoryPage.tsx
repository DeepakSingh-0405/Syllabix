import React, { useState, useMemo } from 'react';
import { Subject } from '../types';
import { Hero } from '../components/Hero';
import { FilterPills } from '../components/FilterPills';
import { SyllabusCard } from '../components/SyllabusCard';
import { DetailsDrawer } from '../components/DetailsDrawer';
import { FlashcardDeckModal } from '../components/FlashcardDeckModal';
import { RotateCcw, GraduationCap, Building2, X, Upload } from 'lucide-react';

export interface DirectoryPageProps {
  subjects: Subject[];
  loading: boolean;
  onNavigateToAssistant: (subjectCode?: string) => void;
  onOpenUpload?: (subject?: Subject) => void;
}

export const AVAILABLE_BRANCHES = [
  { code: 'all', name: 'All Branches' },
  { code: 'CSE', name: 'Computer Science (CSE)' },
  { code: 'IT', name: 'Information Tech (IT)' },
  { code: 'ECE', name: 'Electronics (ECE)' },
  { code: 'ME', name: 'Mechanical (ME)' },
  { code: 'CE', name: 'Civil (CE)' },
] as const;

export const AVAILABLE_SEMESTERS = [
  { value: 'all', label: 'All Semesters' },
  { value: 1, label: 'Sem 1' },
  { value: 2, label: 'Sem 2' },
  { value: 3, label: 'Sem 3' },
  { value: 4, label: 'Sem 4' },
  { value: 5, label: 'Sem 5' },
  { value: 6, label: 'Sem 6' },
  { value: 7, label: 'Sem 7' },
  { value: 8, label: 'Sem 8' },
] as const;

export function getSubjectBranch(subject: Subject): string {
  if (subject.branch) return subject.branch.toUpperCase();
  const code = (subject.code || '').toUpperCase();
  if (code.startsWith('CS') || code.startsWith('CSE')) return 'CSE';
  if (code.startsWith('IT')) return 'IT';
  if (code.startsWith('EC') || code.startsWith('ECE')) return 'ECE';
  if (code.startsWith('ME')) return 'ME';
  if (code.startsWith('CE') || code.startsWith('CIVIL')) return 'CE';
  return 'CSE';
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  subjects,
  loading,
  onNavigateToAssistant,
  onOpenUpload,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
  const [selectedDetailsSubject, setSelectedDetailsSubject] = useState<Subject | null>(null);
  const [flashcardSubject, setFlashcardSubject] = useState<Subject | null>(null);

  // Compute branch-scoped subjects for dynamic subject pill rail
  const branchAndSemScopedSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchBranch = selectedBranch === 'all' || getSubjectBranch(s) === selectedBranch.toUpperCase();
      const matchSem = selectedSemester === 'all' || s.semester === Number(selectedSemester);
      return matchBranch && matchSem;
    });
  }, [subjects, selectedBranch, selectedSemester]);

  // Dynamic filter subjects list with topic counts
  const filterList = useMemo(() => {
    return branchAndSemScopedSubjects.map((s) => ({
      code: s.code,
      name: s.code,
      count: s.topicCount || 16,
    }));
  }, [branchAndSemScopedSubjects]);

  // Fully filtered dataset for syllabus grid
  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return subjects.filter((s) => {
      // 1. Branch filter
      if (selectedBranch !== 'all') {
        const subjectBranch = getSubjectBranch(s);
        if (subjectBranch !== selectedBranch.toUpperCase()) return false;
      }

      // 2. Semester filter
      if (selectedSemester !== 'all') {
        if (s.semester !== Number(selectedSemester)) return false;
      }

      // 3. Subject code pill filter
      if (selectedSubjectCode && s.code !== selectedSubjectCode) {
        return false;
      }

      // 4. Text search query
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
  }, [subjects, selectedBranch, selectedSemester, selectedSubjectCode, searchQuery]);

  const hasActiveFilters = Boolean(
    selectedBranch !== 'all' ||
    selectedSemester !== 'all' ||
    selectedSubjectCode ||
    searchQuery.trim()
  );

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedBranch('all');
    setSelectedSemester('all');
    setSelectedSubjectCode(null);
  };

  return (
    <>
      {/* Hero & Discovery Masthead */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalSyllabiCount={subjects.length}
      />

      {/* Multi-Dimensional Filter Control Bar (Branch & Semester) */}
      <section
        aria-label="Academic Curriculum Filters"
        className="w-full max-w-[1440px] mx-auto px-space-4 pt-4 pb-2 space-y-3"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-xl bg-surface-muted/60 border border-border-default shadow-xs">
          {/* Left: Branch & Semester Selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Filter Selector */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-tertiary uppercase tracking-wider shrink-0">
                <Building2 className="w-3.5 h-3.5 text-accent-strong" aria-hidden="true" />
                <span>Branch:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by branch">
                {AVAILABLE_BRANCHES.map((b) => {
                  const isSelected = selectedBranch === b.code;
                  return (
                    <button
                      key={b.code}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedBranch(b.code);
                        setSelectedSubjectCode(null);
                      }}
                      className={`h-7 px-2.5 rounded-md text-[12px] font-medium transition-all ${
                        isSelected
                          ? 'bg-accent/20 text-accent-strong border border-accent/40 shadow-xs'
                          : 'bg-surface-elevated text-text-tertiary border border-border-default hover:text-text-secondary hover:border-border-interactive'
                      }`}
                    >
                      {b.code === 'all' ? 'All' : b.code}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="hidden md:block w-px h-5 bg-border-default" aria-hidden="true" />

            {/* Semester Filter Selector */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-text-tertiary uppercase tracking-wider shrink-0">
                <GraduationCap className="w-3.5 h-3.5 text-accent-green" aria-hidden="true" />
                <span>Semester:</span>
              </span>
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by semester">
                {AVAILABLE_SEMESTERS.map((sem) => {
                  const isSelected = selectedSemester === sem.value;
                  return (
                    <button
                      key={String(sem.value)}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedSemester(sem.value);
                        setSelectedSubjectCode(null);
                      }}
                      className={`h-7 px-2 rounded-md text-[12px] font-medium transition-all ${
                        isSelected
                          ? 'bg-accent-green/20 text-accent-green border border-accent-green/40 shadow-xs'
                          : 'bg-surface-elevated text-text-tertiary border border-border-default hover:text-text-secondary hover:border-border-interactive'
                      }`}
                    >
                      {sem.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Upload Trigger & Clear Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {onOpenUpload && (
              <button
                type="button"
                onClick={() => onOpenUpload()}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-accent text-surface-canvas text-[12px] font-medium hover:bg-accent-strong transition-colors shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Contribute Syllabus</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-text-tertiary hover:text-text-secondary border border-border-default hover:bg-surface-interactive text-[12px] font-medium transition-colors"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Chips Rail */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[12px] text-text-tertiary">Active filters:</span>
            {selectedBranch !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent/15 text-accent-strong border border-accent/30">
                Branch: {selectedBranch}
                <button
                  type="button"
                  onClick={() => setSelectedBranch('all')}
                  className="hover:opacity-80"
                  aria-label="Remove branch filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSemester !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-accent-green/15 text-accent-green border border-accent-green/30">
                Semester {selectedSemester}
                <button
                  type="button"
                  onClick={() => setSelectedSemester('all')}
                  className="hover:opacity-80"
                  aria-label="Remove semester filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSubjectCode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-interactive text-text-secondary border border-border-interactive">
                Subject: {selectedSubjectCode}
                <button
                  type="button"
                  onClick={() => setSelectedSubjectCode(null)}
                  className="hover:opacity-80"
                  aria-label="Remove subject filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-surface-interactive text-text-secondary border border-border-interactive">
                &ldquo;{searchQuery.trim()}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:opacity-80"
                  aria-label="Clear search query"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <span className="text-[11px] text-text-tertiary ml-auto">
              Showing {filteredSubjects.length} of {subjects.length} courses
            </span>
          </div>
        )}
      </section>

      {/* Category Filter Pill Rail (Dynamically scoped by branch & semester) */}
      <FilterPills
        subjects={filterList}
        selectedSubject={selectedSubjectCode}
        onSelectSubject={setSelectedSubjectCode}
        totalCount={branchAndSemScopedSubjects.length}
      />

      {/* Main Syllabus Directory Grid (WCAG A11Y-05: Target of Skip Link) */}
      <main id="main-content" aria-busy={loading} className="w-full max-w-[1440px] mx-auto px-space-4 pt-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 py-8" role="status" aria-label="Loading syllabi">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[220px] bg-surface-muted border border-border-default rounded-xl animate-pulse"
                aria-hidden="true"
              />
            ))}
          </div>
        ) : filteredSubjects.length > 0 ? (
          <ul
            role="list"
            aria-label="All syllabi"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredSubjects.map((subject) => (
              <SyllabusCard
                key={subject._id || subject.code}
                subject={subject}
                onOpenDetails={(sub) => setSelectedDetailsSubject(sub)}
              />
            ))}
          </ul>
        ) : (
          /* Empty Filter State (Strictly compliant with design.md Section 4.4) */
          <div
            role="status"
            aria-live="polite"
            className="p-10 border border-dashed border-border-default rounded-lg text-center bg-surface-muted/50 my-6 max-w-xl mx-auto space-y-3"
          >
            <h2 className="text-[18px] font-semibold text-text-secondary">
              No syllabi match your active filter criteria
            </h2>
            <p className="text-[14px] text-text-tertiary">
              Try adjusting the branch, selecting another semester, or resetting filters to see all available curricula.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="inline-flex items-center gap-1.5 bg-surface-muted text-text-secondary border border-border-interactive px-4 py-2 rounded-md hover:bg-surface-interactive text-[14px] font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </main>

      {/* Details Drawer */}
      <DetailsDrawer
        subject={selectedDetailsSubject}
        onClose={() => setSelectedDetailsSubject(null)}
        onOpenAssistantForSubject={(sub) => {
          setSelectedDetailsSubject(null);
          onNavigateToAssistant(sub.code);
        }}
        onOpenFlashcards={(sub) => {
          setFlashcardSubject(sub);
        }}
      />

      {/* Flashcard Deck Modal */}
      <FlashcardDeckModal
        isOpen={Boolean(flashcardSubject)}
        onClose={() => setFlashcardSubject(null)}
        subject={flashcardSubject}
      />
    </>
  );
};
