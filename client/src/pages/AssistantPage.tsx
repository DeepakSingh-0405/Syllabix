import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, isBackendUnavailableError } from '../lib/api';
import { Subject, AIResponse, AICitation } from '../types';
import { CitationViewerModal } from '../components/CitationViewerModal';
import { synthesizeAssistantAnswer } from '../lib/curriculumSynthesis';
import {
  Sparkles,
  Send,
  BookOpen,
  AlertCircle,
  ArrowRight,
  Paperclip,
  FileText,
  X,
  FileCheck,
  Copy,
  Check,
  Info,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AICitation[];
  model?: string;
  timestamp: Date;
  attachedDocName?: string;
}

interface AssistantPageProps {
  subjects: Subject[];
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ subjects }) => {
  const [searchParams] = useSearchParams();

  // Initialize selectedSubjectId from URL search param (?subject=CS-201 or ?subject=id)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    const subjectParam = new URLSearchParams(window.location.search).get('subject');
    if (subjectParam && subjects.length > 0) {
      const matched = subjects.find(
        (s) => s.code.toLowerCase() === subjectParam.toLowerCase() || s._id === subjectParam
      );
      if (matched) return matched._id;
    }
    return subjects[0]?._id || '';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your real-time Syllabix AI Academic Assistant powered by Google Gemini. Ask me any doubt of any kind — from university exam questions, theoretical proofs, and algorithm derivations to code debugging.\n\nYou can also attach or scan a specific syllabus document, lecture note, or course excerpt below for context-grounded examination answers.',
      model: 'gemini-3.8-flash',
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<AICitation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Specific Document Scan Context state
  const [scannedDoc, setScannedDoc] = useState<{
    name: string;
    text: string;
    sizeKb: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync selectedSubjectId if URL search param (?subject=...) changes
  useEffect(() => {
    const subjectParam = searchParams.get('subject');
    if (!subjectParam || subjects.length === 0) return;

    const matched = subjects.find(
      (s) => s.code.toLowerCase() === subjectParam.toLowerCase() || s._id === subjectParam
    );
    if (matched) {
      setSelectedSubjectId(matched._id);
    }
  }, [searchParams, subjects]);

  const activeSubject = useMemo(
    () => subjects.find((s) => s._id === selectedSubjectId) || subjects[0],
    [subjects, selectedSubjectId]
  );

  const suggestedPrompts = useMemo(() => {
    if (!activeSubject) {
      return [
        'Explain core curriculum invariants and examination proofs.',
        'What are the primary asymptotic bounds and recurrence relations?',
        'Provide a step-by-step derivation for the foundational units.',
        'What are common exam pitfalls and boundary edge cases?',
      ];
    }
    const name = activeSubject.name.toLowerCase();
    const code = activeSubject.code.toUpperCase();

    if (code.includes('201') || name.includes('data structure') || name.includes('algorithm')) {
      return [
        `Explain AVL tree balance factors and double rotations with step-by-step example.`,
        `Derive the asymptotic bounds of Dijkstra vs Bellman-Ford algorithm.`,
        `Explain amortized analysis using the aggregate method vs potential function.`,
        `Compare Red-Black Tree invariant maintenance with B-Trees.`,
      ];
    }
    if (code.includes('202') || name.includes('operating system')) {
      return [
        `What are the 4 Coffman conditions for deadlock in OS and how does Banker's algorithm prevent it?`,
        `Explain Virtual Memory demand paging, TLB misses, and the Clock replacement algorithm.`,
        `Compare Preemptive Round-Robin scheduling with Multi-Level Feedback Queues.`,
        `Explain mutual exclusion implementation using Peterson's algorithm vs semaphores.`,
      ];
    }
    if (code.includes('203') || name.includes('database') || name.includes('dbms')) {
      return [
        `Explain 1NF to BCNF database normalization with functional dependency losslessness proof.`,
        `How does Two-Phase Locking (2PL) guarantee serializability in concurrent transactions?`,
        `Compare B+ Tree indexing with Hash indexing for range queries in SQL.`,
        `Explain write-ahead logging (WAL) and ARIES crash recovery mechanics.`,
      ];
    }
    if (code.includes('SE') || name.includes('software engineering')) {
      return [
        `What are the key differences between Scrum sprint retrospectives and sprint reviews?`,
        `Explain SOLID design principles with concrete code refactoring examples.`,
        `Compare black-box equivalence partitioning with white-box cyclomatic complexity.`,
        `How do CI/CD automated deployment pipelines enforce test coverage gates?`,
      ];
    }
    return [
      `Summarize high-yield examination topics and proof requirements for ${activeSubject.name}.`,
      `What are the core mathematical and conceptual invariants in ${activeSubject.code}?`,
      `Explain the primary theoretical derivation for Unit 1 in ${activeSubject.name}.`,
      `What are common semester exam pitfalls and edge-case boundaries in ${activeSubject.name}?`,
    ];
  }, [activeSubject]);

  useEffect(() => {
    const chatContainer = chatEndRef.current?.parentElement;
    chatContainer?.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Handle Document Attachment & Scanning with Binary PDF Guardrail
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploadNotice(null);

    // Binary PDF guardrail: prevent garbled binary streams from being read into prompt
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
      setUploadNotice(
        `"${file.name}" is a binary PDF document. For complete PDF text extraction and chapter chunking, please use "Submit syllabus" in the top navigation bar to ingest into the Syllabus Library. For instant chat context, attach plain-text notes (.txt, .md, .json) or copy and paste the excerpt.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Detect binary non-text content
        const hasBinary = /[\x00-\x08\x0E-\x1F]/.test(content.slice(0, 1000));
        if (hasBinary) {
          setUploadNotice(
            `"${file.name}" contains non-text binary data. Please upload binary documents to the Syllabus Library via "Submit syllabus", or attach standard plain-text files.`
          );
          return;
        }

        setScannedDoc({
          name: file.name,
          text: content,
          sizeKb: Math.round(file.size / 1024),
        });
      }
    };

    reader.onerror = () => {
      setError('Unable to read selected document. Please choose a text-readable TXT, markdown, or JSON file.');
    };

    // Read as plain text
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || loading) return;

    setInputQuery('');
    setError(null);

    const currentDoc = scannedDoc;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text.trim(),
      attachedDocName: currentDoc?.name,
      timestamp: new Date(),
    };

    // Append user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Assemble multi-turn history excluding the initial assistant greeting
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const payload: any = {
        prompt: text.trim(),
        subjectId: selectedSubjectId,
        history,
      };

      if (currentDoc) {
        payload.scannedDocumentText = currentDoc.text.slice(0, 12000);
        payload.documentName = currentDoc.name;
      }

      const data = await api.post<AIResponse>('/ai/study-assistant/query', payload);

      const assistantMessage: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        model: data.model || 'gemini-1.5-flash',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      if (isBackendUnavailableError(err)) {
        console.warn('[AssistantPage] Backend unreachable. Synthesizing answer client-side via curriculum knowledge base.');
        const synthesized = synthesizeAssistantAnswer(text.trim(), activeSubject, currentDoc);
        const assistantMessage: ChatMessage = {
          id: 'ai-' + Date.now(),
          role: 'assistant',
          content: synthesized.answer,
          citations: synthesized.citations,
          model: synthesized.model,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setUploadNotice('Offline curriculum synthesis active. Responses grounded in course syllabus.');
        setError(null);
      } else {
        setError(err.message || 'Failed to generate answer. Please verify backend connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-space-4 py-space-4 flex flex-col flex-1 min-h-[calc(100vh-60px)]">
      {/* Page Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-2 pb-space-3 border-b border-border-default mb-space-3">
        <div>
          <h1 className="text-[20px] font-semibold text-text-secondary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-text-secondary" />
            <span>AI academic study assistant</span>
          </h1>
          <p className="text-[14px] text-text-tertiary">
            Real-time doubt answering powered by Google Gemini with specific document scanning
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-1.5 sm:flex-row sm:items-center">
          <label htmlFor="assistant-subject" className="text-[12px] text-text-tertiary font-medium">
            Curriculum context:
          </label>
          <select
            id="assistant-subject"
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full min-w-0 max-w-full rounded-md border border-border-interactive bg-surface-muted px-2.5 py-1.5 text-[12px] text-text-secondary outline-none focus-visible:shadow-focus sm:w-auto"
          >
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.code} — {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-4 flex-1">
        {/* Left Column: Document Scanner & Exam Starters (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-3">
          {/* Specific Document Scan Card */}
          <div className="p-space-3 bg-surface-muted border border-border-interactive rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase font-semibold text-text-secondary flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-text-secondary" />
                <span>Document scan approach</span>
              </span>
              <span className="text-[12px] bg-surface-interactive px-2 py-0.5 rounded border border-border-default text-text-tertiary font-mono">
                Contextual Grounding
              </span>
            </div>

            <p className="text-[12px] text-text-tertiary leading-relaxed">
              Attach a specific syllabus note or document excerpt to ground Gemini&apos;s answer in your exact course material.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".txt,.md,.json,.csv,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* User guidance notice for PDFs / binary files */}
            {uploadNotice && (
              <div
                role="status"
                className="p-2.5 bg-surface-base border border-border-interactive rounded-md text-[12px] text-text-primary flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-text-secondary text-[12px]">Library Upload Recommended</p>
                    <p className="text-text-tertiary text-[12px] leading-relaxed">{uploadNotice}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadNotice(null)}
                  aria-label="Dismiss notice"
                  className="text-text-tertiary hover:text-text-secondary p-1 rounded transition-colors focus-visible:shadow-focus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {scannedDoc ? (
              <div className="p-2.5 bg-surface-base border border-border-interactive rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-text-secondary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-text-secondary truncate">
                      {scannedDoc.name}
                    </p>
                    <p className="text-[12px] text-text-tertiary">
                      {scannedDoc.sizeKb} KB text context scanned
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setScannedDoc(null)}
                  title="Remove scanned document"
                  className="p-1 text-text-tertiary hover:text-text-secondary transition-colors focus-visible:shadow-focus"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-md border border-dashed border-border-interactive hover:border-text-secondary bg-surface-base text-[12px] text-text-secondary font-medium transition-colors focus-visible:shadow-focus"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Scan / Attach specific document</span>
              </button>
            )}
          </div>

          {/* Active Course Guideline */}
          <div className="p-space-3 bg-surface-muted border border-border-default rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[12px] font-semibold text-text-secondary bg-surface-base px-2 py-0.5 rounded border border-border-default">
                {activeSubject?.code}
              </span>
              <span className="text-[12px] text-text-tertiary">
                Sem {activeSubject?.semester} • {activeSubject?.credits} Credits
              </span>
            </div>
            <h2 className="text-[14px] font-semibold text-text-secondary line-clamp-1">
              {activeSubject?.name}
            </h2>
            <p className="text-[12px] text-text-tertiary line-clamp-2">
              {activeSubject?.description}
            </p>
          </div>

          {/* Suggested Exam Starters */}
          <div className="p-space-3 bg-surface-muted border border-border-default rounded-lg space-y-2">
            <span className="text-[12px] uppercase font-medium text-text-tertiary tracking-wider">
              Sample university questions
            </span>
            <div className="space-y-1.5">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2 rounded bg-surface-base border border-border-default hover:border-border-interactive hover:bg-surface-interactive/50 text-[12px] text-text-primary transition-all flex items-start gap-2 group focus-visible:shadow-focus"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-text-tertiary shrink-0 mt-0.5 group-hover:text-text-secondary transition-colors" />
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Conversational AI Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-surface-muted border border-border-interactive rounded-lg overflow-hidden h-[calc(100vh-210px)]">
          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto p-space-4 space-y-space-4 bg-surface-base/40">
            {error && (
              <div className="p-3 bg-status-errorSurface border border-status-error rounded-md text-[14px] text-status-error flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="underline text-[12px] ml-2 text-status-error font-medium hover:opacity-80 focus-visible:shadow-focus"
                >
                  Retry query
                </button>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-medium text-text-secondary">
                      {isUser ? 'You' : 'Syllabix AI'}
                    </span>
                    {!isUser && msg.model && (
                      <span className="text-[12px] font-mono text-text-tertiary px-1.5 py-0.5 bg-surface-interactive rounded border border-border-default">
                        {msg.model}
                      </span>
                    )}
                    <span className="text-[12px] text-text-tertiary">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-2xl p-space-4 rounded-lg text-[14px] leading-relaxed border space-y-3 relative group ${
                      isUser
                        ? 'bg-surface-interactive border-border-interactive text-text-secondary'
                        : 'bg-surface-muted border-border-default text-text-primary'
                    }`}
                  >
                    {msg.attachedDocName && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-base border border-border-default text-[12px] text-text-tertiary mb-1">
                        <FileText className="w-3 h-3 text-text-secondary" />
                        <span>Context: {msg.attachedDocName}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-line font-light">
                      {msg.content}
                    </div>

                    {/* Copy action for assistant answers */}
                    {!isUser && (
                      <div className="flex items-center justify-between pt-2 border-t border-border-default/40">
                        <span className="text-[12px] text-text-tertiary">
                          Generated in real time
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors focus-visible:shadow-focus"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-text-secondary" />
                              <span className="text-text-secondary font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy explanation</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Grounded Citations Bar */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 border-t border-border-default space-y-1.5">
                        <span className="text-[12px] uppercase font-semibold text-text-tertiary tracking-wider block">
                          Verified citations ({msg.citations.length})
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.citations.map((cite, cIdx) => (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => setSelectedCitation(cite)}
                              className="inline-flex items-center gap-1.5 bg-surface-base border border-border-interactive text-[12px] text-text-secondary px-2.5 py-1 rounded hover:bg-surface-interactive transition-colors focus-visible:shadow-focus"
                            >
                              <BookOpen className="w-3 h-3 text-text-secondary" />
                              <span>{cite.title} (p. {cite.pageNumber})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex flex-col items-start space-y-2 animate-pulse" aria-busy="true">
                <span className="text-[12px] font-medium text-text-tertiary flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-text-secondary animate-spin" />
                  <span>
                    {scannedDoc
                      ? `Scanning "${scannedDoc.name}" & formulating response with Gemini...`
                      : 'Formulating step-by-step academic response with Google Gemini...'}
                  </span>
                </span>
                <div className="w-80 h-20 bg-surface-interactive rounded-md" />
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Attached Document Indicator Bar */}
          {scannedDoc && (
            <div className="px-space-3 py-1.5 bg-surface-interactive/80 border-t border-border-default flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-2 text-text-secondary font-medium">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Active scanned context: {scannedDoc.name}</span>
              </div>
              <button
                type="button"
                onClick={() => setScannedDoc(null)}
                className="text-text-tertiary hover:text-text-secondary text-[12px] underline focus-visible:shadow-focus"
              >
                Detach
              </button>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-space-3 border-t border-border-default bg-surface-base flex items-center gap-space-2"
          >
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach specific document for context"
              className="p-2 rounded-md border border-border-interactive text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors focus-visible:shadow-focus"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                scannedDoc
                  ? `Ask any doubt about "${scannedDoc.name}"...`
                  : `Ask any doubt, concept, or algorithm problem...`
              }
              className="min-w-0 flex-1 bg-surface-muted border border-border-interactive text-text-secondary text-[14px] px-space-3 py-2 rounded-md placeholder:text-text-disabled focus-visible:shadow-focus outline-none"
            />

            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              aria-label="Submit doubt"
              className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[14px] px-space-3 py-2 rounded-md hover:opacity-90 disabled:opacity-40 active:scale-[0.98] transition-all focus-visible:shadow-focus"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>

      {/* Citation Inspector Modal */}
      {selectedCitation && (
        <CitationViewerModal
          citation={selectedCitation}
          onClose={() => setSelectedCitation(null)}
        />
      )}
    </div>
  );
};
