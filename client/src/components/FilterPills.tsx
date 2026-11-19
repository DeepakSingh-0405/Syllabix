import React, { useRef } from 'react';

interface FilterPillsProps {
  subjects: { code: string; name: string; count: number }[];
  selectedSubject: string | null;
  onSelectSubject: (code: string | null) => void;
  totalCount: number;
}

export const FilterPills: React.FC<FilterPillsProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject,
  totalCount,
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);

  // Roving tabindex implementation for keyboard accessibility (A11Y-05)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const buttons = listRef.current?.querySelectorAll('button');
    if (!buttons || buttons.length === 0) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (index + 1) % buttons.length;
      buttons[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (index - 1 + buttons.length) % buttons.length;
      buttons[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      buttons[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      buttons[buttons.length - 1]?.focus();
    }
  };

  return (
    <section aria-label="Subject filters" className="w-full max-w-[1440px] mx-auto px-space-4 py-2">
      <ul
        ref={listRef}
        role="list"
        aria-label="Filter by subject"
        className="flex items-center gap-space-1 overflow-x-auto scrollbar-none py-1 scroll-smooth"
      >
        {/* "All" Filter Pill */}
        <li className="shrink-0">
          <button
            type="button"
            aria-pressed={selectedSubject === null}
            onClick={() => onSelectSubject(null)}
            onKeyDown={(e) => handleKeyDown(e, 0)}
            tabIndex={selectedSubject === null ? 0 : -1}
            className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13px] transition-all duration-fast ${
              selectedSubject === null
                ? 'bg-surface-interactive text-text-secondary border border-text-secondary font-medium'
                : 'bg-transparent text-text-primary border border-border-default hover:bg-surface-interactive hover:text-text-secondary hover:border-text-tertiary'
            }`}
          >
            <span>All subjects</span>
            <span className="text-[11px] text-text-tertiary">({totalCount})</span>
          </button>
        </li>

        {/* Dynamic Subject Filter Pills */}
        {subjects.map((sub, idx) => {
          const isSelected = selectedSubject === sub.code;
          return (
            <li key={sub.code} className="shrink-0">
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelectSubject(isSelected ? null : sub.code)}
                onKeyDown={(e) => handleKeyDown(e, idx + 1)}
                tabIndex={isSelected ? 0 : -1}
                className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 text-[13px] transition-all duration-fast ${
                  isSelected
                    ? 'bg-surface-interactive text-text-secondary border border-text-secondary font-medium'
                    : 'bg-transparent text-text-primary border border-border-default hover:bg-surface-interactive hover:text-text-secondary hover:border-text-tertiary'
                }`}
              >
                <span>{sub.name}</span>
                <span className="text-[11px] text-text-tertiary">({sub.count})</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
