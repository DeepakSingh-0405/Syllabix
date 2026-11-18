import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { Subject } from '../types';
import { X, RotateCw, CheckCircle2, ChevronLeft, ChevronRight, Layers, Sparkles, AlertCircle } from 'lucide-react';

interface Flashcard {
  _id: string;
  front: string;
  back: string;
  sourceRef: string;
  interval: number;
}

interface FlashcardDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export const FlashcardDeckModal: React.FC<FlashcardDeckModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback((regenerate: boolean = false) => {
    if (!subject) return;
    if (regenerate) setRegenerating(true);
    else setLoading(true);

    setError(null);
    setIsFlipped(false);
    setCurrentIndex(0);

    const url = `/ai/flashcards/${subject._id}${regenerate ? '?regenerate=true' : ''}`;
    api.get<{ deck: any; cards: Flashcard[] }>(url)
      .then((res) => {
        if (res && res.cards && res.cards.length > 0) {
          setCards(res.cards);
        } else {
          setCards([]);
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load dynamic flashcards. Please retry.');
        setCards([]);
      })
      .finally(() => {
        setLoading(false);
        setRegenerating(false);
      });
  }, [subject]);

  useEffect(() => {
    if (!isOpen || !subject) return;
    setReviewedCount(0);
    fetchCards(false);
  }, [isOpen, subject, fetchCards]);

  const currentCard = cards[currentIndex];

  const handleReview = useCallback(async (quality: number) => {
    if (!currentCard) return;
    try {
      await api.post(`/ai/flashcards/${currentCard._id}/review`, { quality });
    } catch {
      // offline fallback
    }

    setReviewedCount((prev) => prev + 1);
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentCard, currentIndex, cards.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard Navigation: Space/Enter flip, Left/Right navigate, 1-4 SM-2 score rating
  useEffect(() => {
    if (!isOpen || !subject) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === '1' && isFlipped) {
        e.preventDefault();
        handleReview(1);
      } else if (e.key === '2' && isFlipped) {
        e.preventDefault();
        handleReview(3);
      } else if (e.key === '3' && isFlipped) {
        e.preventDefault();
        handleReview(4);
      } else if (e.key === '4' && isFlipped) {
        e.preventDefault();
        handleReview(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, subject, isFlipped, handlePrev, handleNext, handleReview]);

  if (!isOpen || !subject) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="flashcard-deck-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-space-4 bg-surface-base/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl bg-surface-muted border border-border-interactive rounded-lg shadow-md p-space-4 sm:p-6 flex flex-col min-h-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-3 border-b border-border-default mb-space-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-surface-interactive border border-border-interactive flex items-center justify-center text-text-secondary">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h2 id="flashcard-deck-title" className="text-[18px] font-semibold text-text-secondary">
                {subject.code} — 3D Spaced Recall Deck
              </h2>
              <p className="text-[12px] text-text-tertiary">
                SuperMemo SM-2 spaced repetition algorithm
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || regenerating}
              onClick={() => fetchCards(true)}
              aria-busy={regenerating}
              className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary py-1 px-2.5 rounded bg-surface-base hover:bg-surface-interactive border border-border-default hover:border-border-interactive transition-colors disabled:opacity-50 focus-visible:shadow-focus"
              title="Regenerate flashcards from uploaded course documents with Gemini"
            >
              <Sparkles className={`w-3.5 h-3.5 text-text-secondary ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Regenerating...' : 'Regenerate with AI'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close flashcards"
              className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors focus-visible:shadow-focus"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error panel with retry button */}
        {error && (
          <div
            role="alert"
            className="p-space-3 my-2 rounded-lg bg-status-errorSurface border border-status-error text-status-error space-y-2"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-[14px] font-medium">Flashcard Generation Failed</span>
            </div>
            <p className="text-[12px] text-text-primary">
              {error}
            </p>
            <button
              type="button"
              onClick={() => fetchCards(false)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-base border border-border-interactive text-text-secondary text-[12px] font-medium hover:bg-surface-interactive active:scale-[0.98] transition-all focus-visible:shadow-focus"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry loading cards</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-text-tertiary" aria-busy="true">
            <span className="w-6 h-6 border-2 border-text-secondary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-[14px] text-text-secondary font-medium">Generating spaced recall cards with Gemini 3.8 Flash...</p>
            <p className="text-[12px] text-text-tertiary mt-1">Deriving active recall questions from course syllabus & documents</p>
          </div>
        ) : cards.length === 0 && !error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-3">
            <Sparkles className="w-8 h-8 text-text-tertiary mx-auto opacity-50" />
            <p className="text-[14px] font-semibold text-text-secondary">No flashcards generated yet</p>
            <p className="text-[12px] text-text-tertiary">Click regenerate to build a fresh active recall deck with Gemini.</p>
            <button
              type="button"
              onClick={() => fetchCards(true)}
              className="px-4 py-2 bg-text-secondary text-surface-base text-[14px] font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all focus-visible:shadow-focus"
            >
              Generate flashcard deck
            </button>
          </div>
        ) : cards.length > 0 ? (
          <div className="flex-1 flex flex-col justify-between">
            {/* Card Progress Indicator */}
            <div className="flex items-center justify-between text-[12px] text-text-tertiary mb-3">
              <span>Card {currentIndex + 1} of {cards.length}</span>
              <span className="text-text-secondary font-medium">Reviewed: {reviewedCount}</span>
            </div>

            {/* 3D Flip Card Container (Framer Motion 3D rotateY: 180deg) */}
            <div
              className="relative w-full h-[260px] cursor-pointer select-none [perspective:1000px]"
              onClick={() => setIsFlipped(!isFlipped)}
              tabIndex={0}
              role="button"
              aria-label={`Flashcard: ${isFlipped ? 'Answer shown' : 'Question shown'}. Press Space or Enter to flip.`}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setIsFlipped(!isFlipped);
                }
              }}
            >
              <motion.div
                className="w-full h-full relative [transform-style:preserve-3d] rounded-lg border border-border-interactive bg-surface-base p-space-4 flex flex-col justify-between shadow-md"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              >
                {/* Front Side */}
                <div className="w-full h-full flex flex-col justify-between [backface-visibility:hidden]">
                  <div className="flex items-center justify-between text-[12px] text-text-tertiary">
                    <span className="uppercase tracking-wider font-medium">Question / Concept</span>
                    <span className="inline-flex items-center gap-1">
                      <RotateCw className="w-3 h-3" /> Space or Click to flip
                    </span>
                  </div>
                  <div className="my-auto py-2">
                    <p className="text-[16px] sm:text-[18px] leading-[26px] font-medium text-text-secondary">
                      {currentCard?.front}
                    </p>
                  </div>
                  <div className="text-[12px] text-text-tertiary">
                    {currentCard?.sourceRef}
                  </div>
                </div>

                {/* Back Side (180deg rotated) */}
                <div className="absolute inset-0 p-space-4 flex flex-col justify-between rounded-lg bg-surface-interactive [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="flex items-center justify-between text-[12px] text-text-tertiary">
                    <span className="uppercase tracking-wider font-medium text-text-secondary">Explanation & Proof</span>
                    <span className="inline-flex items-center gap-1 text-text-secondary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-text-secondary" /> Grounded
                    </span>
                  </div>
                  <div className="my-auto py-2 overflow-y-auto pr-1">
                    <p className="text-[14px] leading-[20px] font-light text-text-secondary whitespace-pre-line">
                      {currentCard?.back}
                    </p>
                  </div>
                  <div className="text-[12px] text-text-tertiary border-t border-border-default/60 pt-1">
                    Citation: {currentCard?.sourceRef}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Assessment Feedback (SuperMemo SM-2 Quality Scores) */}
            {isFlipped ? (
              <div className="mt-4 pt-3 border-t border-border-default">
                <p className="text-[12px] font-medium text-text-tertiary text-center mb-2">
                  How well did you know this concept? (Keys 1 - 4)
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleReview(1)}
                    className="py-1.5 rounded-md text-[12px] font-medium bg-surface-base border border-border-default text-text-tertiary hover:border-status-error hover:text-status-error active:scale-[0.98] transition-all focus-visible:shadow-focus"
                  >
                    1: Again (1d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(3)}
                    className="py-1.5 rounded-md text-[12px] font-medium bg-surface-base border border-border-default text-text-tertiary hover:border-text-secondary hover:text-text-secondary active:scale-[0.98] transition-all focus-visible:shadow-focus"
                  >
                    2: Hard (2d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(4)}
                    className="py-1.5 rounded-md text-[12px] font-medium bg-surface-base border border-border-default text-text-tertiary hover:border-text-secondary hover:text-text-secondary active:scale-[0.98] transition-all focus-visible:shadow-focus"
                  >
                    3: Good (4d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(5)}
                    className="py-1.5 rounded-md text-[12px] font-medium bg-text-secondary text-surface-base hover:opacity-90 active:scale-[0.98] transition-all focus-visible:shadow-focus"
                  >
                    4: Easy (7d)
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-default">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1 text-[14px] text-text-tertiary hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:shadow-focus"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlipped(true)}
                  className="inline-flex items-center gap-1.5 bg-surface-base border border-border-interactive px-4 py-1.5 rounded-md text-[14px] font-medium text-text-secondary hover:bg-surface-interactive active:scale-[0.98] transition-all focus-visible:shadow-focus"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Reveal answer</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === cards.length - 1}
                  className="inline-flex items-center gap-1 text-[14px] text-text-tertiary hover:text-text-secondary disabled:opacity-30 disabled:cursor-not-allowed focus-visible:shadow-focus"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Keyboard shortcut legend */}
            <div className="flex items-center justify-center gap-2 pt-2 text-[12px] text-text-tertiary">
              <span>Shortcuts:</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-base border border-border-default font-mono text-[12px]">Space / Enter</kbd>
              <span>flip</span>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-base border border-border-default font-mono text-[12px]">← / →</kbd>
              <span>navigate</span>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-base border border-border-default font-mono text-[12px]">1-4</kbd>
              <span>rate</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
