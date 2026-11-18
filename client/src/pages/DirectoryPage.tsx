import React, { useState, useMemo } from 'react';
import { Subject } from '../types';
import { Hero } from '../components/Hero';
import { FilterPills } from '../components/FilterPills';
import { SyllabusCard } from '../components/SyllabusCard';
import { DetailsDrawer } from '../components/DetailsDrawer';
import { FlashcardDeckModal } from '../components/FlashcardDeckModal';
import { UploadModal } from '../components/UploadModal';
import { RotateCcw } from 'lucide-react';

interface DirectoryPageProps {
  subjects: Subject[];
  loading: boolean;
  onRefreshSubjects: () => void;
  isUploadOpen: boolean;
  onCloseUpload: () => void;
  onNavigateToAssistant: (subjectCode?: string) => void;
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  subjects,
  loading,
  onRefreshSubjects,
  isUploadOpen,
  onCloseUpload,
  onNavigateToAssistant,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string | null>(null);
  const [selectedDetailsSubject, setSelectedDetailsSubject] = useState<Subject | null>(null);
  const [flashcardSubject, setFlashcardSubject] = useState<Subject | null>(null);

  // Dynamic filter subjects list with counts
  const filterList = useMemo(() => {
    return subjects.map((s) => ({
      code: s.code,
      name: s.code,
      count: s.topicCount || 16,
    }));
  }, [subjects]);

  // Filtered dataset
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesCode = selectedSubjectCode ? s.code === selectedSubjectCode : true;
      const matchesSearch = searchQuery.trim()
        ? s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCode && matchesSearch;
    });
  }, [subjects, selectedSubjectCode, searchQuery]);

  return (
    <>
      {/* Hero & Discovery Masthead */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalSyllabiCount={subjects.length}
      />

      {/* Category Filter Pill Rail */}
      <FilterPills
        subjects={filterList}
        selectedSubject={selectedSubjectCode}
        onSelectSubject={setSelectedSubjectCode}
        totalCount={subjects.length}
      />

      {/* Main Syllabus Directory Grid (WCAG A11Y-05: Target of Skip Link) */}
      <main id="main-content" className="w-full max-w-[1440px] mx-auto px-space-4 pt-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-4 py-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[200px] bg-surface-muted border border-border-default rounded-lg animate-pulse"
                aria-label="Loading syllabus card"
              />
            ))}
          </div>
        ) : filteredSubjects.length > 0 ? (
          <ul
            role="list"
            aria-label="All syllabi"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-space-4"
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
              No syllabi match &quot;{searchQuery || selectedSubjectCode}&quot;
            </h2>
            <p className="text-[14px] text-text-tertiary">
              Clear active subject filters or try searching for a broader course keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubjectCode(null);
              }}
              className="inline-flex items-center gap-1.5 bg-surface-muted text-text-secondary border border-border-interactive px-4 py-2 rounded-md hover:bg-surface-interactive text-[14px] font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset filters</span>
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

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={onCloseUpload}
        subjects={subjects}
        onUploadSuccess={onRefreshSubjects}
      />
    </>
  );
};
