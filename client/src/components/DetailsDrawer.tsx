import React, { useState } from 'react';
import { Subject } from '../types';
import { api } from '../lib/api';
import { X, Sparkles, Layers, RotateCw, CheckCircle2, AlertCircle, HelpCircle, Check, RefreshCw } from 'lucide-react';

interface DetailsDrawerProps {
  subject: Subject | null;
  onClose: () => void;
  onOpenAssistantForSubject: (subject: Subject) => void;
  onOpenFlashcards: (subject: Subject) => void;
}

interface UnitBreakdownItem {
  unitNumber?: number;
  unit?: string;
  title?: string;
  weightage?: string;
  topics?: string[];
  coreTopics?: string[];
  coreFormulasOrPrinciples?: string[];
  highYieldConcepts?: string[];
}

interface SummaryData {
  title: string;
  subjectCode: string;
  subjectName?: string;
  keyTakeaways: string[];
  unitBreakdown?: UnitBreakdownItem[];
  examPrepTips?: string[];
  structuredNotes: string;
  model: string;
  generatedAt?: string;
}

interface QuizItem {
  id: string;
  type?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const DetailsDrawer: React.FC<DetailsDrawerProps> = ({
  subject,
  onClose,
  onOpenAssistantForSubject,
  onOpenFlashcards,
}) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'summary' | 'practice'>('syllabus');
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizItem[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loadingAction, setLoadingAction] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);

  if (!subject) return null;

  const handleFetchSummary = async (force: boolean = false) => {
    if (summaryData && !force) return;
    setLoadingAction(true);
    setSummaryError(null);
    try {
      const res = await api.post<any>('/ai/summarize', {
        subjectId: subject._id,
        subjectCode: subject.code,
        subjectName: subject.name,
        format: 'detailed',
      });
      if (res) {
        setSummaryData(res);
      } else {
        throw new Error('Received empty summary response.');
      }
    } catch (err: any) {
      setSummaryError(err.message || 'Failed to synthesize revision notes from course materials. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFetchPractice = async (force: boolean = false) => {
    if (quizQuestions && !force) return;
    setLoadingAction(true);
    setQuizError(null);
    setSelectedAnswers({});
    try {
      const res = await api.post<any>('/ai/quiz', {
        subjectId: subject._id,
        subjectCode: subject.code,
        subjectName: subject.name,
        difficulty: 'medium',
        questionCount: 4,
      });
      if (res && res.questions && res.questions.length > 0) {
        setQuizQuestions(res.questions);
      } else {
        throw new Error('Received empty questions set.');
      }
    } catch (err: any) {
      setQuizError(err.message || 'Failed to formulate practice quiz questions. Please try again.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (selectedAnswers[questionId] !== undefined) return; // Prevent re-selection once answered
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
  };

  // Score metrics
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalCount = quizQuestions?.length || 0;
  const correctCount = quizQuestions
    ? quizQuestions.filter((q, idx) => selectedAnswers[q.id || `q-${idx}`] === q.correctIndex).length
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-subject-title"
      className="fixed inset-0 z-50 flex items-center justify-end bg-surface-base/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-xl h-full bg-surface-muted border-l border-border-default shadow-md p-space-4 sm:p-6 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-space-3 border-b border-border-default mb-space-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-medium text-text-tertiary bg-surface-base px-2 py-0.5 rounded-sm border border-border-default">
                {subject.code}
              </span>
              <span className="text-[12px] text-text-tertiary">Semester {subject.semester}</span>
              {subject.isCore && (
                <span className="text-[12px] font-medium text-text-secondary bg-surface-interactive border border-border-interactive px-1.5 py-0.5 rounded-sm">
                  Core curriculum
                </span>
              )}
            </div>
            <h2 id="drawer-subject-title" className="text-[20px] font-semibold text-text-secondary">
              {subject.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors focus-visible:shadow-focus"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1 border-b border-border-default pb-space-2 mb-space-4">
          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`px-3 py-1.5 text-[14px] rounded-md transition-colors focus-visible:shadow-focus ${
              activeTab === 'syllabus'
                ? 'bg-surface-interactive text-text-secondary font-medium border border-border-interactive'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Syllabus units
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('summary');
              handleFetchSummary(false);
            }}
            className={`px-3 py-1.5 text-[14px] rounded-md transition-colors focus-visible:shadow-focus ${
              activeTab === 'summary'
                ? 'bg-surface-interactive text-text-secondary font-medium border border-border-interactive'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            AI summary
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('practice');
              handleFetchPractice(false);
            }}
            className={`px-3 py-1.5 text-[14px] rounded-md transition-colors focus-visible:shadow-focus ${
              activeTab === 'practice'
                ? 'bg-surface-interactive text-text-secondary font-medium border border-border-interactive'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Practice quiz
          </button>
        </div>

        {/* Tab 1: Syllabus Units Breakdown */}
        {activeTab === 'syllabus' && (
          <div className="space-y-4 flex-1 flex flex-col">
            <p className="text-[14px] leading-[20px] text-text-tertiary font-light">
              {subject.description}
            </p>

            <div className="space-y-3 mt-4">
              <h3 className="text-[14px] font-semibold text-text-secondary uppercase tracking-wider">
                Module structure & units
              </h3>
              {[
                { num: 1, title: 'Foundational Theory, Notations, and Proofs', topics: 5 },
                { num: 2, title: 'Core Mechanics, Algorithms, and Models', topics: 6 },
                { num: 3, title: 'Advanced Structures & Multi-component Workflows', topics: 6 },
                { num: 4, title: 'Real-world Systems, Scaling, and Complexity Limits', topics: 7 },
              ].map((u) => (
                <div key={u.num} className="bg-surface-base border border-border-default rounded-md p-space-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-medium text-text-tertiary">Unit {u.num}</span>
                    <span className="text-[12px] text-text-tertiary">{u.topics} curriculum topics</span>
                  </div>
                  <p className="text-[14px] font-medium text-text-secondary">{u.title}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 mt-auto space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFlashcards(subject);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-surface-interactive border border-border-interactive text-text-secondary font-medium text-[14px] py-2.5 rounded-md hover:bg-surface-base hover:border-text-secondary active:scale-[0.98] transition-all focus-visible:shadow-focus"
              >
                <Layers className="w-4 h-4 text-text-secondary" />
                <span>Open 3D Spaced Recall Flashcards</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAssistantForSubject(subject);
                }}
                className="w-full inline-flex items-center justify-center gap-2 bg-text-secondary text-surface-base font-medium text-[14px] py-2.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all focus-visible:shadow-focus"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask AI study assistant about {subject.code}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Contextual AI Summary */}
        {activeTab === 'summary' && (
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-tertiary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
                <span>Context-grounded revision notes</span>
              </span>
              <button
                type="button"
                disabled={loadingAction}
                onClick={() => handleFetchSummary(true)}
                className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary py-1 px-2 rounded hover:bg-surface-interactive border border-border-default hover:border-border-interactive transition-colors disabled:opacity-50 focus-visible:shadow-focus"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
                <span>Regenerate with Gemini</span>
              </button>
            </div>

            {/* Error panel with retry button */}
            {summaryError && (
              <div
                role="alert"
                className="p-space-3 rounded-lg bg-status-errorSurface border border-status-error text-status-error space-y-2"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-[14px] font-medium">Summary Generation Failed</span>
                </div>
                <p className="text-[12px] text-text-primary">
                  {summaryError}
                </p>
                <button
                  type="button"
                  onClick={() => handleFetchSummary(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-base border border-border-interactive text-text-secondary text-[12px] font-medium hover:bg-surface-interactive active:scale-[0.98] transition-all focus-visible:shadow-focus"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry summary generation</span>
                </button>
              </div>
            )}

            {loadingAction ? (
              <div className="py-16 text-center text-text-tertiary" aria-busy="true">
                <span className="w-6 h-6 border-2 border-text-secondary border-t-transparent rounded-full animate-spin inline-block mb-3" />
                <p className="text-[14px] text-text-secondary font-medium">Synthesizing revision notes with Gemini...</p>
                <p className="text-[12px] text-text-tertiary mt-1">Extracting core curriculum concepts and examination focus areas</p>
              </div>
            ) : summaryData ? (
              <div className="space-y-4">
                {/* Guide Title Header */}
                <div className="bg-surface-base border border-border-default rounded-md p-space-3">
                  <h3 className="text-[16px] font-semibold text-text-secondary">
                    {summaryData.title || `Executive Revision Summary: ${subject.name}`}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[12px] text-text-tertiary">
                    <span>Course: {subject.code}</span>
                    <span>•</span>
                    <span>Model: {summaryData.model || 'gemini-3.8-flash'}</span>
                  </div>
                </div>

                {/* High-yield Takeaways */}
                {summaryData.keyTakeaways && summaryData.keyTakeaways.length > 0 && (
                  <div className="bg-surface-base border border-border-interactive rounded-md p-space-3">
                    <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-text-secondary" />
                      <span>High-yield examination takeaways</span>
                    </p>
                    <ul className="space-y-1.5">
                      {summaryData.keyTakeaways.map((point, i) => (
                        <li key={i} className="text-[14px] text-text-tertiary flex items-start gap-2">
                          <span className="text-text-secondary font-medium">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Unit Breakdown */}
                {summaryData.unitBreakdown && summaryData.unitBreakdown.length > 0 && (
                  <div className="bg-surface-base border border-border-default rounded-md p-space-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-text-secondary" />
                        <span>Curriculum unit breakdown</span>
                      </p>
                      <span className="text-[12px] text-text-tertiary">
                        {summaryData.unitBreakdown.length} units
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {summaryData.unitBreakdown.map((unit, uIdx) => {
                        const topics = unit.coreTopics || unit.topics || [];
                        const concepts = unit.highYieldConcepts || unit.coreFormulasOrPrinciples || [];
                        const unitLabel = unit.unitNumber ? `Unit ${unit.unitNumber}` : (unit.unit || `Unit ${uIdx + 1}`);
                        const unitTitle = unit.title || unit.unit || `${unitLabel}`;

                        return (
                          <div key={uIdx} className="bg-surface-muted border border-border-default rounded p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] font-semibold text-text-secondary">{unitLabel}</span>
                              {unit.weightage && (
                                <span className="text-[12px] text-text-tertiary bg-surface-base px-2 py-0.5 rounded border border-border-default">
                                  Weightage: {unit.weightage}
                                </span>
                              )}
                            </div>
                            <p className="text-[14px] font-medium text-text-secondary">{unitTitle}</p>
                            {topics.length > 0 && (
                              <div className="text-[12px] text-text-tertiary flex flex-wrap gap-1 items-center pt-1">
                                <span className="text-text-secondary font-medium">Core topics:</span>
                                {topics.map((t, tIdx) => (
                                  <span key={tIdx} className="bg-surface-base px-1.5 py-0.5 rounded border border-border-default">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                            {concepts.length > 0 && (
                              <div className="text-[12px] text-text-tertiary flex flex-wrap gap-1 items-center pt-0.5">
                                <span className="text-text-secondary font-medium">High-yield concepts:</span>
                                {concepts.map((c, cIdx) => (
                                  <span key={cIdx} className="bg-surface-interactive px-1.5 py-0.5 rounded border border-border-interactive text-text-secondary">
                                    {c}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Structured Notes */}
                <div className="bg-surface-base border border-border-default rounded-md p-space-4">
                  <div className="text-[14px] leading-[20px] text-text-primary whitespace-pre-line font-light">
                    {summaryData.structuredNotes}
                  </div>
                </div>

                {/* Exam Prep Tips */}
                {summaryData.examPrepTips && summaryData.examPrepTips.length > 0 && (
                  <div className="bg-surface-base border border-border-default rounded-md p-space-3">
                    <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
                      Actionable semester exam advice
                    </p>
                    <ul className="space-y-1">
                      {summaryData.examPrepTips.map((tip, i) => (
                        <li key={i} className="text-[12px] text-text-tertiary flex items-start gap-2">
                          <span className="text-text-secondary">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : !summaryError ? (
              <div className="py-12 text-center text-text-tertiary">
                <p className="text-[14px]">No summary available. Click below to generate.</p>
                <button
                  type="button"
                  onClick={() => handleFetchSummary(true)}
                  className="mt-3 px-4 py-2 bg-text-secondary text-surface-base text-[14px] font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all focus-visible:shadow-focus"
                >
                  Generate course summary
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Tab 3: Interactive Practice Quiz */}
        {activeTab === 'practice' && (
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] text-text-tertiary flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-text-secondary" />
                <span>Pedagogical examination questions</span>
              </span>
              <button
                type="button"
                disabled={loadingAction}
                onClick={() => handleFetchPractice(true)}
                className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary py-1 px-2 rounded hover:bg-surface-interactive border border-border-default hover:border-border-interactive transition-colors disabled:opacity-50 focus-visible:shadow-focus"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loadingAction ? 'animate-spin' : ''}`} />
                <span>New questions</span>
              </button>
            </div>

            {/* Error panel with retry button */}
            {quizError && (
              <div
                role="alert"
                className="p-space-3 rounded-lg bg-status-errorSurface border border-status-error text-status-error space-y-2"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-[14px] font-medium">Practice Quiz Formulation Failed</span>
                </div>
                <p className="text-[12px] text-text-primary">
                  {quizError}
                </p>
                <button
                  type="button"
                  onClick={() => handleFetchPractice(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface-base border border-border-interactive text-text-secondary text-[12px] font-medium hover:bg-surface-interactive active:scale-[0.98] transition-all focus-visible:shadow-focus"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry quiz generation</span>
                </button>
              </div>
            )}

            {loadingAction ? (
              <div className="py-16 text-center text-text-tertiary" aria-busy="true">
                <span className="w-6 h-6 border-2 border-text-secondary border-t-transparent rounded-full animate-spin inline-block mb-3" />
                <p className="text-[14px] text-text-secondary font-medium">Formulating questions with Gemini 3.8 Flash...</p>
                <p className="text-[12px] text-text-tertiary mt-1">Grounding questions in syllabus units and conceptual proof patterns</p>
              </div>
            ) : quizQuestions && quizQuestions.length > 0 ? (
              <div className="space-y-4">
                {/* Score & Progress Tracker Bar */}
                <div className="bg-surface-base border border-border-default rounded-md p-space-3 flex items-center justify-between">
                  <div>
                    <span className="text-[12px] text-text-tertiary uppercase tracking-wider block">Quiz Progress</span>
                    <span className="text-[14px] font-medium text-text-secondary">
                      {answeredCount} of {totalCount} answered
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] text-text-tertiary uppercase tracking-wider block">Score</span>
                    <span className="text-[14px] font-semibold text-text-secondary">
                      {correctCount} / {totalCount} correct ({correctCount * 10} pts)
                    </span>
                  </div>
                  {answeredCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium bg-surface-interactive border border-border-interactive text-text-secondary rounded hover:bg-surface-base active:scale-[0.98] transition-all focus-visible:shadow-focus"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset quiz</span>
                    </button>
                  )}
                </div>

                {/* Completion summary if all answered */}
                {answeredCount === totalCount && totalCount > 0 && (
                  <div className="p-space-3 bg-surface-interactive border border-border-interactive rounded-md flex items-center justify-between">
                    <div>
                      <p className="text-[14px] font-semibold text-text-secondary">Quiz complete!</p>
                      <p className="text-[12px] text-text-tertiary">
                        Final score: {correctCount} / {totalCount} ({Math.round((correctCount / totalCount) * 100)}%)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetQuiz}
                        className="px-3 py-1.5 text-[12px] font-medium bg-surface-base border border-border-interactive text-text-secondary rounded-md hover:bg-surface-interactive active:scale-[0.98] transition-all focus-visible:shadow-focus"
                      >
                        Retake quiz
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFetchPractice(true)}
                        className="px-3 py-1.5 text-[12px] font-medium bg-text-secondary text-surface-base rounded-md hover:opacity-90 active:scale-[0.98] transition-all focus-visible:shadow-focus"
                      >
                        New questions
                      </button>
                    </div>
                  </div>
                )}

                {/* Questions List */}
                {quizQuestions.map((q, idx) => {
                  const userAnswer = selectedAnswers[q.id || `q-${idx}`];
                  const hasAnswered = userAnswer !== undefined;
                  const isCorrect = hasAnswered && userAnswer === q.correctIndex;

                  return (
                    <div
                      key={q.id || idx}
                      className="bg-surface-base border border-border-default rounded-md p-space-3 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[14px] font-medium text-text-secondary leading-snug">
                          {idx + 1}. {q.question}
                        </p>
                        {hasAnswered && (
                          <span
                            className={`text-[12px] font-medium px-2 py-0.5 rounded border shrink-0 ${
                              isCorrect
                                ? 'bg-surface-interactive border-border-interactive text-text-secondary'
                                : 'bg-status-errorSurface border-status-error text-status-error'
                            }`}
                          >
                            {isCorrect ? 'Correct (+10 pts)' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isOptionSelected = userAnswer === optIdx;
                          const isOptionCorrect = optIdx === q.correctIndex;

                          let optionStyle = 'bg-surface-muted border-border-default text-text-tertiary hover:text-text-secondary hover:border-border-interactive cursor-pointer';

                          if (hasAnswered) {
                            if (isOptionCorrect) {
                              optionStyle = 'bg-surface-interactive border-text-secondary text-text-secondary font-medium';
                            } else if (isOptionSelected) {
                              optionStyle = 'bg-status-errorSurface border-status-error text-status-error line-through';
                            } else {
                              optionStyle = 'bg-surface-muted/50 border-border-default/50 text-text-disabled cursor-not-allowed';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={hasAnswered}
                              onClick={() => handleSelectOption(q.id || `q-${idx}`, optIdx)}
                              className={`w-full text-left flex items-center justify-between p-2 rounded text-[14px] border transition-colors focus-visible:shadow-focus ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[12px] shrink-0 font-medium">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {hasAnswered && isOptionCorrect && (
                                <Check className="w-4 h-4 text-text-secondary shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Pedagogical Explanation */}
                      {hasAnswered && q.explanation && (
                        <div className="mt-2 pt-2 border-t border-border-default/60 text-[12px] leading-[20px] text-text-tertiary bg-surface-interactive/60 p-2.5 rounded border border-border-default">
                          <span className="font-semibold text-text-secondary">Explanation: </span>
                          <span>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : !quizError ? (
              <div className="py-12 text-center text-text-tertiary">
                <p className="text-[14px]">No practice questions available. Click below to formulate.</p>
                <button
                  type="button"
                  onClick={() => handleFetchPractice(true)}
                  className="mt-3 px-4 py-2 bg-text-secondary text-surface-base text-[14px] font-medium rounded-md hover:opacity-90 active:scale-[0.98] transition-all focus-visible:shadow-focus"
                >
                  Generate practice questions
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
