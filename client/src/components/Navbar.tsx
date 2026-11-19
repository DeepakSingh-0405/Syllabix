import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import {
  BarChart3,
  BookOpen,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  Trophy,
  Users,
  Award,
  UploadCloud,
  X,
} from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenAuth: () => void;
}

const navigationItems = [
  { to: '/', label: 'Directory', icon: BookOpen, end: true },
  { to: '/study-rooms', label: 'Study rooms', icon: Users },
  { to: '/mentorship', label: 'Mentors', icon: Award },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/discussions', label: 'Discussions', icon: MessageSquare },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenUpload, onOpenAuth }) => {
  const { session, profile, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-[13px] font-medium transition-colors ${
      isActive
        ? 'border-accent/30 bg-accent/10 text-accent-strong'
        : 'border-transparent text-text-primary hover:border-border-default hover:bg-surface-interactive hover:text-text-secondary'
    }`;

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to syllabus directory
      </a>

      <header className="app-navbar">
        <nav aria-label="Primary" className="app-navbar-inner">
          <div className="flex min-w-0 items-center gap-5">
            <Link to="/" className="app-brand" onClick={() => setIsMenuOpen(false)}>
              <span className="app-brand-mark"><BookOpen className="h-4 w-4" /></span>
              <span>Syllabix</span>
            </Link>

            <div className="hidden items-center gap-1 border-l border-border-default pl-3 xl:flex">
              {navigationItems.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} className={getNavLinkClass}>
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>

            <div className="hidden items-center gap-1 md:flex xl:hidden">
              {navigationItems.slice(1, 4).map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  aria-label={label}
                  className={getNavLinkClass}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </NavLink>
              ))}
            </div>
          </div>

          <div className="app-navbar-actions">
            <NotificationBell />

            <button
              type="button"
              onClick={onOpenUpload}
              aria-label="Submit syllabus"
              className="nav-submit-button"
            >
              <UploadCloud className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Submit syllabus</span>
            </button>

            {session ? (
              <div className="flex items-center gap-2">
                <span className="hidden max-w-36 truncate text-[12px] text-text-tertiary font-medium md:inline-block">
                  {profile?.name || session.user.email?.split('@')[0]}
                </span>
                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="nav-icon-button"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={onOpenAuth} className="nav-signin-button">
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign in</span>
                <span className="sr-only sm:hidden">Sign in</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="compact-navigation"
              className="nav-icon-button xl:hidden"
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {isMenuOpen && (
          <div id="compact-navigation" className="nav-menu-panel xl:hidden">
            <p className="nav-menu-heading">Explore Syllabix</p>
            {navigationItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `nav-menu-link ${isActive ? 'nav-menu-link-active' : ''}`
                }
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </header>
    </>
  );
};
