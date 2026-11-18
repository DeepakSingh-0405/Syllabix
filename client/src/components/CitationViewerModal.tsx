import React from 'react';
import { AICitation } from '../types';
import { X, BookOpen, ShieldCheck } from 'lucide-react';

interface CitationViewerModalProps {
  citation: (AICitation & { excerpt?: string }) | null;
  onClose: () => void;
}

export const CitationViewerModal: React.FC<CitationViewerModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-viewer-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-space-4 bg-surface-base/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg bg-surface-muted border border-border-interactive rounded-lg shadow-md p-space-4 sm:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-3 border-b border-border-default mb-space-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-surface-interactive border border-border-interactive flex items-center justify-center text-text-secondary">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <h2 id="citation-viewer-title" className="text-[16px] font-semibold text-text-secondary">
                Verified Document Source
              </h2>
              <p className="text-[12px] text-text-tertiary">
                Grounded citation referenced in AI answer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close citation"
            className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors focus-visible:shadow-focus"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Details */}
        <div className="space-y-4 my-2">
          <div className="bg-surface-base border border-border-default rounded-md p-space-3 space-y-1">
            <div className="flex items-center justify-between text-[12px] text-text-tertiary">
              <span className="font-medium uppercase tracking-wider">Document Name</span>
              <span className="inline-flex items-center gap-1 text-text-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-text-secondary" /> Grounded source
              </span>
            </div>
            <p className="text-[16px] font-semibold text-text-secondary">{citation.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="bg-surface-base border border-border-default rounded-md p-space-2">
              <span className="text-text-tertiary block mb-0.5">Page / Sheet</span>
              <span className="text-text-secondary font-medium">Page {citation.pageNumber}</span>
            </div>
            <div className="bg-surface-base border border-border-default rounded-md p-space-2">
              <span className="text-text-tertiary block mb-0.5">Section</span>
              <span className="text-text-secondary font-medium">{citation.section || 'General Curriculum'}</span>
            </div>
          </div>

          {citation.excerpt && (
            <div className="bg-surface-base border border-border-default rounded-md p-space-3 space-y-1">
              <span className="text-[12px] font-medium text-text-tertiary uppercase tracking-wider block">
                Extracted Text Excerpt
              </span>
              <blockquote className="text-[14px] leading-[20px] text-text-primary italic border-l-2 border-border-interactive pl-2.5 my-1 font-light">
                &ldquo;{citation.excerpt}&rdquo;
              </blockquote>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="flex items-center justify-end gap-2 pt-space-3 border-t border-border-default mt-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 bg-surface-base border border-border-interactive text-text-secondary px-4 py-2 rounded-md hover:bg-surface-interactive active:scale-[0.98] text-[14px] font-medium transition-all focus-visible:shadow-focus"
          >
            <span>Close preview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
