import React from 'react';
import { Subject } from '../types';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, BookMarked, Layers, Upload } from 'lucide-react';

interface SyllabusCardProps {
  subject: Subject;
  onOpenDetails: (subject: Subject) => void;
  onOpenUpload?: (subject: Subject) => void;
}

export const SyllabusCard: React.FC<SyllabusCardProps> = ({ subject, onOpenDetails, onOpenUpload }) => {
  const reduceMotion = useReducedMotion();

  return (
    <li role="listitem" className="list-none">
      <motion.article
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={reduceMotion ? undefined : { y: -5, rotateX: 1 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 1000, transformStyle: 'preserve-3d' }}
        className="syllabus-card group relative flex h-full flex-col justify-between rounded-xl border border-border-default bg-surface-muted p-5 transition-colors duration-base hover:border-border-interactive hover:bg-surface-interactive hover:shadow-md"
      >
        {/* Top Meta Row */}
        <div>
          <div className="flex items-center justify-between mb-space-3">
            <span className="rounded-md border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-[12px] font-medium tracking-wide text-accent-strong">
              {subject.code}
            </span>
            <div className="flex items-center gap-2 text-text-tertiary">
              {onOpenUpload && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onOpenUpload(subject);
                  }}
                  className="relative z-20 inline-flex items-center gap-1 text-[12px] font-medium text-text-tertiary hover:text-accent-strong py-0.5 px-1.5 rounded hover:bg-surface-base border border-transparent hover:border-border-default transition-all"
                  title={`Upload syllabus for ${subject.code}`}
                  aria-label={`Upload syllabus for ${subject.code}`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload</span>
                </button>
              )}
              <span className="text-[12px]">Sem {subject.semester}</span>
              {subject.isCore && (
                <span className="rounded-full border border-accent-green/20 bg-accent-green/10 px-2 py-0.5 text-[12px] font-medium text-accent-green">
                  Core
                </span>
              )}
            </div>
          </div>

          {/* Title with Mandatory Stretched Link Architecture (A11Y-03, A11Y-05) */}
          <h3 className="mb-2 min-h-[48px] line-clamp-2 text-[18px] leading-[24px] font-semibold text-text-secondary transition-colors group-hover:text-accent-strong">
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

          {/* Description */}
          <p className="mb-space-4 min-h-[40px] line-clamp-2 text-[14px] leading-[20px] font-light text-text-tertiary">
            {subject.description || 'Structured academic learning syllabus including core units, topic breakdown, and examination modules.'}
          </p>
        </div>

        {/* Footer Meta Row */}
        <div className="mt-auto flex items-center justify-between border-t border-border-default/60 pt-space-3">
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
          <div className="text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-fast">
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </motion.article>
    </li>
  );
};
