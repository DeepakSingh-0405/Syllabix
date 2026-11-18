import React from 'react';
import { Search } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalSyllabiCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  totalSyllabiCount,
}) => {
  return (
    <header className="w-full max-w-[1440px] mx-auto px-space-4 pt-10 pb-6 flex flex-col items-start gap-space-3">
      {/* Title */}
      <h1 className="text-[32px] sm:text-[44px] leading-[1.15] font-semibold text-text-secondary tracking-[-0.02em] max-w-3xl">
        Academic curriculum and syllabus intelligence.
      </h1>

      {/* Subtitle */}
      <p className="text-[16px] leading-[24px] text-text-primary font-light max-w-2xl">
        Discover, inspect, and study structured syllabi, learning modules, and course materials across engineering departments. Grounded with AI document search and peer verification.
      </p>

      {/* Instant Search Bar */}
      <div className="w-full max-w-xl relative mt-2">
        <label htmlFor="syllabus-search" className="sr-only">
          Search course code, syllabus title, or subject
        </label>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-text-tertiary pointer-events-none" aria-hidden="true" />
          <input
            id="syllabus-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search course code (e.g. CS-201) or syllabus topic..."
            className="w-full bg-surface-muted text-text-secondary text-[16px] placeholder:text-text-disabled pl-10 pr-20 py-2.5 rounded-md border border-border-interactive focus-visible:ring-2 focus-visible:border-border-focus transition-colors"
          />
          <div className="absolute right-3 hidden sm:flex items-center gap-1 text-[12px] text-text-tertiary bg-surface-interactive px-1.5 py-0.5 rounded border border-border-default pointer-events-none">
            <span>{totalSyllabiCount} modules</span>
          </div>
        </div>
      </div>
    </header>
  );
};
