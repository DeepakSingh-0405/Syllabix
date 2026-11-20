import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, LogIn, UserPlus, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    signInWithPassword,
    signUpWithPassword,
    signInWithEmailOtp,
    signInWithGoogle,
    signInAsDemo,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithPassword(email, password);
        onClose();
      } else if (mode === 'signup') {
        await signUpWithPassword(email, password, fullName);
        onClose();
      } else if (mode === 'magic') {
        await signInWithEmailOtp(email);
        setSuccessMessage('Magic login link dispatched to your email address.');
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const res = await signInWithGoogle();
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role: 'student' | 'mentor') => {
    setLoading(true);
    await signInAsDemo(role);
    setLoading(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-space-4 bg-surface-base/80 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md bg-surface-muted border border-border-interactive rounded-lg shadow-md p-space-4 sm:p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-space-3 border-b border-border-default mb-space-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-surface-interactive border border-border-interactive flex items-center justify-center text-text-secondary">
              <LogIn className="w-4 h-4" />
            </span>
            <div>
              <h2 id="auth-modal-title" className="text-[18px] font-semibold text-text-secondary">
                {mode === 'signin' ? 'Sign in to Syllabix' : mode === 'signup' ? 'Create an account' : 'Magic link login'}
              </h2>
              <p className="text-[12px] text-text-tertiary">
                Academic knowledge and syllabus collaboration
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close authentication dialog"
            className="p-1 rounded-md text-text-tertiary hover:text-text-secondary hover:bg-surface-interactive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-surface-base p-1 rounded-md border border-border-default mb-space-3 text-[14px]">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`py-1.5 rounded transition-colors ${
              mode === 'signin'
                ? 'bg-surface-interactive text-text-secondary font-medium border border-border-interactive'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`py-1.5 rounded transition-colors ${
              mode === 'signup'
                ? 'bg-surface-interactive text-text-secondary font-medium border border-border-interactive'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            Create account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-space-3 p-space-3 bg-status-errorSurface border border-status-error rounded-md text-status-error text-[12px] leading-[18px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-space-3 p-space-3 bg-surface-base border border-border-interactive rounded-md text-text-secondary text-[12px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-text-secondary shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Primary Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-space-3">
          {mode === 'signup' && (
            <div>
              <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                Full name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Mehta"
                className="w-full bg-surface-base text-text-secondary text-[14px] px-3 py-2 rounded-md border border-border-interactive placeholder:text-text-disabled focus-visible:ring-2"
              />
            </div>
          )}

          <div>
            <label className="block text-[12px] font-medium text-text-tertiary mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              className="w-full bg-surface-base text-text-secondary text-[14px] px-3 py-2 rounded-md border border-border-interactive placeholder:text-text-disabled focus-visible:ring-2"
            />
          </div>

          {mode !== 'magic' && (
            <div>
              <label className="block text-[12px] font-medium text-text-tertiary mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-base text-text-secondary text-[14px] px-3 py-2 rounded-md border border-border-interactive placeholder:text-text-disabled focus-visible:ring-2"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-text-secondary text-surface-base font-medium text-[14px] py-2 rounded-md hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-surface-base border-t-transparent rounded-full animate-spin" />
            ) : mode === 'signin' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{mode === 'signin' ? 'Sign in with email' : mode === 'signup' ? 'Register account' : 'Send magic link'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-space-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-default" />
          </div>
          <div className="relative flex justify-center text-[12px] uppercase tracking-wider">
            <span className="bg-surface-muted px-2 text-text-tertiary">Or alternative options</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-surface-base border border-border-interactive text-text-secondary font-medium text-[14px] py-2 rounded-md hover:bg-surface-interactive hover:border-text-secondary transition-colors mb-1"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
        <p className="text-[12px] text-text-tertiary text-center mb-2">
          Note: Google OAuth requires configuring Client ID in Supabase. Or use Email or Demo below.
        </p>

        {/* Instant Zero-Setup Demo Sign-In */}
        <div className="pt-2 border-t border-border-default/60 mt-1">
          <p className="text-[12px] font-medium text-text-tertiary mb-1.5 text-center">
            Zero-configuration testing
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('student')}
              className="inline-flex items-center justify-center gap-1.5 bg-surface-interactive border border-border-interactive text-text-secondary text-[12px] font-medium py-1.5 rounded hover:border-text-secondary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('mentor')}
              className="inline-flex items-center justify-center gap-1.5 bg-surface-interactive border border-border-interactive text-text-secondary text-[12px] font-medium py-1.5 rounded hover:border-text-secondary transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-text-secondary" />
              <span>Demo Mentor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
