import React from 'react';
import { BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-muted border-t border-border-default mt-16">
      <nav aria-label="Footer directory" className="w-full max-w-[1440px] mx-auto px-space-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-secondary font-semibold text-[16px]">
              <span className="w-6 h-6 rounded-sm bg-surface-interactive border border-border-interactive flex items-center justify-center text-text-secondary">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <span>Syllabix</span>
            </div>
            <p className="text-[14px] text-text-tertiary leading-[20px] font-light">
              AI-powered academic syllabus and knowledge directory built on MERN, Supabase, and Google Gemini.
            </p>
          </div>

          {/* Academic Hierarchy */}
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Curriculum</p>
            <ul role="list" className="space-y-1.5 text-[14px] text-text-tertiary">
              <li><a href="#computer-science" className="hover:text-text-secondary transition-colors">Computer science & engineering</a></li>
              <li><a href="#semesters" className="hover:text-text-secondary transition-colors">Semesters 1 through 8</a></li>
              <li><a href="#syllabi" className="hover:text-text-secondary transition-colors">Core curriculum modules</a></li>
              <li><a href="#electives" className="hover:text-text-secondary transition-colors">Departmental electives</a></li>
            </ul>
          </div>

          {/* Platform Primitives */}
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Features</p>
            <ul role="list" className="space-y-1.5 text-[14px] text-text-tertiary">
              <li><a href="#rag-assistant" className="hover:text-text-secondary transition-colors">Document-grounded RAG</a></li>
              <li><a href="#ai-summaries" className="hover:text-text-secondary transition-colors">Revision note generator</a></li>
              <li><a href="#practice-quizzes" className="hover:text-text-secondary transition-colors">Exam practice tests</a></li>
              <li><a href="#community" className="hover:text-text-secondary transition-colors">Community doubt discussions</a></li>
            </ul>
          </div>

          {/* Architecture & Stack */}
          <div className="space-y-2">
            <p className="text-[12px] font-semibold text-text-secondary uppercase tracking-wider">Architecture</p>
            <ul role="list" className="space-y-1.5 text-[14px] text-text-tertiary">
              <li><span className="text-text-tertiary">MERN (MongoDB + Express + React)</span></li>
              <li><span className="text-text-tertiary">Supabase Auth, Storage & Realtime</span></li>
              <li><span className="text-text-tertiary">Google Gemini AI assistance</span></li>
              <li><span className="text-text-tertiary">Responsive design with accessible motion</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border-default/60 flex flex-col sm:flex-row items-center justify-between text-[12px] text-text-tertiary gap-3">
          <p>© 2026 Syllabix. A focused space for learning together.</p>
          <div className="flex items-center gap-4">
            <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary">Supabase Cloud</a>
            <span>•</span>
            <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="hover:text-text-secondary">Google Gemini</a>
          </div>
        </div>
      </nav>
    </footer>
  );
};
