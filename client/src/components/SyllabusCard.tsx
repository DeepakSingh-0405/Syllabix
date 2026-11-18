import React from 'react';
import { Subject } from '../types';
import { ArrowUpRight, BookMarked, Layers } from 'lucide-react';

interface SyllabusCardProps {
  subject: Subject;
  onOpenDetails: (subject: Subject) => void;
}

export const SyllabusCard: React.FC<SyllabusCardProps> = ({ subject, onOpenDetails }) => {
  return (
    <li role="listitem" className="list-none">
      <article className="relative flex flex-col justify-between h-full bg-surface-muted border border-border-default rounded-lg p-space-4 hover:bg-surface-interactive hover:border-border-interactive hover:shadow-md transition-all duration-base group">
        {/* Top Meta Row */}
        <div>
          <div className="flex items-center justify-between mb-space-3">
            <span className="text-[12px] font-medium text-text-tertiary bg-surface-base px-2 py-0.5 rounded-sm border border-border-default">
              {subject.code}
            </span>
            <div className="flex items-center gap-1.5 text-text-tertiary">
              <span className="text-[12px]">Sem {subject.semester}</span>
              {subject.isCore && (
                <span className="text-[12px] font-medium text-text-secondary bg-surface-interactive border border-border-interactive px-1.5 py-0.5 rounded-sm">
                  Core
                </span>
              )}
            </div>
          </div>

          {/* Title with Mandatory Stretched Link Architecture (A11Y-03, A11Y-05) */}
          <h3 className="text-[18px] leading-[24px] font-semibold text-text-secondary group-hover:text-text-secondary transition-colors line-clamp-1 mb-2">
            <a
              href={`#details-${subject.code}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenDetails(subject);
              }}
              className="card-stretched-link focus-visible:outline-none"
            >
              {subject.name}
            </a>
          </h3>

          {/* Description — Strictly uses --color-text-tertiary (#a6a6a6) for >= 4.5:1 contrast on #080808 (A11Y-01) */}
          <p className="text-[14px] leading-[20px] font-light text-text-tertiary line-clamp-2 min-h-[40px] mb-space-4">
            {subject.description || 'Structured academic learning syllabus including core units, topic breakdown, and examination modules.'}
          </p>
        </div>

        {/* Footer Meta Row */}
        <div className="flex items-center justify-between pt-space-3 border-t border-border-default/60 mt-auto">
          <div className="flex items-center gap-space-2 text-[12px] text-text-tertiary">
            <span className="inline-flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{subject.topicCount || 16} topics</span>
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <BookMarked className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{subject.credits} credits</span>
            </span>
          </div>

          {/* Trailing Indicator */}
          <div className="text-text-tertiary group-hover:text-text-secondary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-fast">
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </article>
    </li>
  );
};
