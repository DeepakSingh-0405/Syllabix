import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import {
  BookOpen,
  Sparkles,
  UploadCloud,
  LogIn,
  LogOut,
  Users,
  Award,
  Trophy,
  BarChart3,
  MessageSquare,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onOpenAuth }) => {
  const { session, profile, signOut } = useAuth();

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 text-[13px] font-medium px-space-2 py-1 rounded-md transition-colors ${
      isActive
        ? 'text-text-secondary bg-surface-interactive border border-border-interactive shadow-sm'
        : 'text-text-primary hover:text-text-secondary hover:bg-surface-interactive'
    }`;

  return (
    <>
      {/* WCAG 2.2 AA Mandatory Skip Navigation Link */}
      <a href="#main-content" className="skip-link">
        Skip to syllabus directory
      </a>

      <header className="sticky top-0 z-50 w-full bg-surface-base border-b border-border-default h-[60px] flex items-center">
        <nav aria-label="Primary" className="w-full max-w-[1440px] mx-auto px-space-4 flex items-center justify-between">
          {/* Brand Wordmark & Primary Route Links */}
          <div className="flex items-center gap-space-3">
            <Link
              to="/"
              className="flex items-center gap-space-2 group text-text-secondary font-semibold text-[18px] tracking-tight focus-visible:ring-2"
            >
              <span className="w-7 h-7 rounded-sm bg-surface-interactive border border-border-interactive flex items-center justify-center text-text-secondary">
                <BookOpen className="w-4 h-4 text-text-secondary" />
              </span>
              <span>Syllabix</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 border-l border-border-default pl-space-3">
              <NavLink to="/" end className={getNavLinkClass}>
                <span>Directory</span>
              </NavLink>

              <NavLink to="/study-rooms" className={getNavLinkClass}>
                <Users className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Study rooms</span>
              </NavLink>

              <NavLink to="/mentorship" className={getNavLinkClass}>
                <Award className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Mentors</span>
              </NavLink>

              <NavLink to="/assistant" className={getNavLinkClass}>
                <Sparkles className="w-3.5 h-3.5 text-text-tertiary" />
                <span>AI Assistant</span>
              </NavLink>

              <NavLink to="/discussions" className={getNavLinkClass}>
                <MessageSquare className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Discussions</span>
              </NavLink>

              <NavLink to="/leaderboard" className={getNavLinkClass}>
                <Trophy className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Leaderboard</span>
              </NavLink>

              <NavLink to="/analytics" className={getNavLinkClass}>
                <BarChart3 className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Analytics</span>
              </NavLink>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-space-2 sm:gap-space-3">
            {/* Quick Mobile Navigation Dropdown / Links */}
            <div className="flex lg:hidden items-center gap-1">
              <NavLink to="/study-rooms" className={getNavLinkClass} title="Study rooms">
                <Users className="w-4 h-4" />
              </NavLink>
              <NavLink to="/mentorship" className={getNavLinkClass} title="Mentors">
                <Award className="w-4 h-4" />
              </NavLink>
              <NavLink to="/assistant" className={getNavLinkClass} title="AI Assistant">
                <Sparkles className="w-4 h-4" />
              </NavLink>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Primary Action Button (Submit syllabus) */}
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 bg-text-secondary text-surface-base font-medium text-[13px] px-space-3 py-1.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Submit syllabus</span>
            </button>

            {/* Auth Button */}
            {session ? (
              <div className="flex items-center gap-2">
                <span className="hidden md:inline-block text-[12px] text-text-tertiary font-medium">
                  {profile?.name || session.user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="p-1.5 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary bg-surface-base border border-border-interactive px-space-3 py-1.5 rounded-md hover:bg-surface-interactive transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
            )}
          </div>
        </nav>
      </header>
    </>
  );
};
