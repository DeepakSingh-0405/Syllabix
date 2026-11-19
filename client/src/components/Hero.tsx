import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, BookOpen, Check, Clock3, Layers3, Search, Sparkles } from 'lucide-react';

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
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const context = gsap.context(() => {
      gsap.from('.hero-entrance', {
        opacity: 0,
        y: 22,
        duration: 0.72,
        stagger: 0.09,
        ease: 'power3.out',
        clearProps: 'all',
      });
    }, heroRef);

    return () => context.revert();
  }, []);

  return (
    <header ref={heroRef} className="hero-section">
      <div className="hero-copy">
        <div className="hero-badge hero-entrance">
          <span className="hero-badge-spark"><Sparkles className="h-3.5 w-3.5" /></span>
          <span>YOUR PERSONAL STUDY SPACE</span>
          <span className="hero-badge-divider" aria-hidden="true" />
          <span className="hero-live-indicator"><span /> BUILT FOR FOCUS</span>
        </div>

        <h1 className="hero-title hero-entrance">
          Make every subject
          <span>feel within reach.</span>
        </h1>

        <p className="hero-description hero-entrance">
          Find your next focus, understand the hard parts, and build a study rhythm that lasts.
          Your curriculum, community, and AI study partner — all in one place.
        </p>

        <div className="hero-search hero-entrance">
          <label htmlFor="syllabus-search" className="sr-only">
            Search course code, syllabus title, or subject
          </label>
          <Search className="hero-search-icon" aria-hidden="true" />
          <input
            id="syllabus-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search a subject, course code, or topic..."
          />
          <span className="hero-search-count">{totalSyllabiCount} subjects</span>
        </div>

        <div className="hero-actions hero-entrance">
          <a href="#main-content" className="hero-primary-action">
            Explore the curriculum
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link to="/assistant" className="hero-secondary-action">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Meet your AI tutor
          </Link>
        </div>

        <div className="hero-proof hero-entrance" aria-label="Platform highlights">
          <span><Check className="h-3.5 w-3.5" /> Curated course outlines</span>
          <span><Check className="h-3.5 w-3.5" /> Study tools in one place</span>
        </div>
      </div>

      <aside className="hero-visual hero-entrance" aria-label="Study workspace preview">
        <div className="hero-orbit hero-orbit-one" />
        <div className="hero-orbit hero-orbit-two" />
        <div className="hero-orbit-core" aria-hidden="true">
          <div className="hero-orbit-core-inner"><BookOpen className="h-7 w-7" /></div>
        </div>

        <div className="hero-preview-card">
          <div className="hero-preview-topline">
            <span className="hero-preview-label">YOUR NEXT FOCUS</span>
            <span className="hero-preview-status"><span /> READY</span>
          </div>
          <div className="hero-course-icon"><Layers3 className="h-5 w-5" /></div>
          <p className="hero-course-code">CS-201 <span>•</span> SEMESTER 3</p>
          <h2>Data Structures &amp; Algorithms</h2>
          <p className="hero-course-note">Small steps. Strong foundations.</p>
          <div className="hero-progress">
            <div className="hero-progress-labels"><span>Learning path</span><span>3 of 8 topics</span></div>
            <div className="hero-progress-track"><span /></div>
          </div>
          <div className="hero-preview-footer">
            <span><Clock3 className="h-3.5 w-3.5" /> 20 min focus session</span>
            <span className="hero-preview-check"><Check className="h-3.5 w-3.5" /></span>
          </div>
        </div>

        <div className="hero-floating-note">
          <span className="hero-note-icon"><Sparkles className="h-4 w-4" /></span>
          <span><strong>One clear next step</strong><small>Keep your momentum going</small></span>
        </div>
      </aside>
    </header>
  );
};
