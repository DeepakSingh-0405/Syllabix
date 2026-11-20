import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  session: Session | null;
  supabaseUser: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithEmailOtp: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInAsDemo: (role?: 'student' | 'mentor') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (activeSession?: Session | null) => {
    const currentSession = activeSession !== undefined ? activeSession : session;
    try {
      const data = await api.get<User>('/users/me');
      if (data && data._id) {
        setProfile(data);
        return;
      }
    } catch {
      // Backend offline or fallback mode
    }

    // Resilient fallback: bootstrap profile from session metadata
    if (currentSession?.user) {
      setProfile({
        _id: 'local_user',
        supabaseUserId: currentSession.user.id,
        email: currentSession.user.email || 'student@syllabix.edu',
        name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split('@')[0] || 'Student',
        role: (currentSession.user.user_metadata?.role as any) || 'student',
        reputationPoints: 25,
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Check local demo session first with validity & expiration check
    const savedDemo = localStorage.getItem('syllabix_demo_session');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        const expiresAt = parsed?.session?.expires_at;
        const isExpired = expiresAt && Date.now() / 1000 > expiresAt;
        if (!isExpired && parsed?.session) {
          setSession(parsed.session);
          setSupabaseUser(parsed.session.user);
          setProfile(parsed.profile);
          setLoading(false);
        } else {
          localStorage.removeItem('syllabix_demo_session');
        }
      } catch {
        localStorage.removeItem('syllabix_demo_session');
      }
    }

    // 2. Check active Supabase session if no demo session
    if (!localStorage.getItem('syllabix_demo_session')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        if (!localStorage.getItem('syllabix_demo_session')) {
          setSession(session);
          setSupabaseUser(session?.user ?? null);
          if (session) {
            fetchProfile(session);
          }
        }
        setLoading(false);
      }).catch(() => {
        if (isMounted) setLoading(false);
      });
    }

    // 3. Listen to Supabase auth state transitions
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      // If a local demo session is active, do not let Supabase's null session wipe it out
      if (localStorage.getItem('syllabix_demo_session')) {
        return;
      }
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session) {
        fetchProfile(session);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      throw new Error('Please enter both email address and password.');
    }

    // A. Local demo/mock mode if Supabase is unconfigured
    if (!isSupabaseConfigured) {
      const isMentor = trimmedEmail.toLowerCase().includes('mentor');
      const cleanName = trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const mockUser: SupabaseUser = {
        id: isMentor ? 'demo-mentor-id-001' : 'demo-student-id-001',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: cleanName, role: isMentor ? 'mentor' : 'student' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: trimmedEmail,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        access_token: isMentor ? 'demo-mentor-bearer-token' : 'demo-bearer-token',
        token_type: 'bearer',
        expires_in: 86400,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        refresh_token: 'demo-refresh-token',
        user: mockUser,
      };

      const mockProfile: User = {
        _id: isMentor ? 'demo_mentor_profile' : 'demo_user_profile',
        supabaseUserId: mockUser.id,
        email: trimmedEmail,
        name: cleanName,
        role: isMentor ? 'mentor' : 'student',
        reputationPoints: isMentor ? 240 : 120,
      };

      localStorage.setItem(
        'syllabix_demo_session',
        JSON.stringify({ session: mockSession, profile: mockProfile })
      );

      setSession(mockSession);
      setSupabaseUser(mockUser);
      setProfile(mockProfile);
      return;
    }

    // B. Remote Supabase Authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) throw error;
      localStorage.removeItem('syllabix_demo_session');
      setSession(data.session);
      setSupabaseUser(data.user);
      await fetchProfile(data.session);
    } catch (err: any) {
      const isNetworkError = err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.name === 'TypeError';

      if (isNetworkError) {
        console.warn('[AuthContext] Remote Supabase unreachable; activating local session fallback.');
        await signInAsDemo(trimmedEmail.toLowerCase().includes('mentor') ? 'mentor' : 'student');
        return;
      }
      throw err;
    }
  };

  const signUpWithPassword = async (email: string, password: string, fullName: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim() || trimmedEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    if (!trimmedEmail || !password) {
      throw new Error('Email address and password are required.');
    }

    // A. Local demo/mock mode if Supabase is unconfigured
    if (!isSupabaseConfigured) {
      const isMentor = trimmedEmail.toLowerCase().includes('mentor');
      const mockUser: SupabaseUser = {
        id: isMentor ? 'demo-mentor-id-001' : 'demo-student-id-001',
        app_metadata: { provider: 'email' },
        user_metadata: { full_name: trimmedName, role: isMentor ? 'mentor' : 'student' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: trimmedEmail,
        phone: '',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      };

      const mockSession: Session = {
        access_token: isMentor ? 'demo-mentor-bearer-token' : 'demo-bearer-token',
        token_type: 'bearer',
        expires_in: 86400,
        expires_at: Math.floor(Date.now() / 1000) + 86400,
        refresh_token: 'demo-refresh-token',
        user: mockUser,
      };

      const mockProfile: User = {
        _id: isMentor ? 'demo_mentor_profile' : 'demo_user_profile',
        supabaseUserId: mockUser.id,
        email: trimmedEmail,
        name: trimmedName,
        role: isMentor ? 'mentor' : 'student',
        reputationPoints: isMentor ? 240 : 50,
      };

      localStorage.setItem(
        'syllabix_demo_session',
        JSON.stringify({ session: mockSession, profile: mockProfile })
      );

      setSession(mockSession);
      setSupabaseUser(mockUser);
      setProfile(mockProfile);
      return;
    }

    // B. Remote Supabase Registration
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          },
        },
      });
      if (error) throw error;
      if (data.session) {
        localStorage.removeItem('syllabix_demo_session');
        setSession(data.session);
        setSupabaseUser(data.user);
        await fetchProfile(data.session);
      }
    } catch (err: any) {
      const isNetworkError = err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.name === 'TypeError';

      if (isNetworkError) {
        console.warn('[AuthContext] Remote Supabase unreachable; activating local registered session.');
        await signInAsDemo(trimmedEmail.toLowerCase().includes('mentor') ? 'mentor' : 'student');
        return;
      }
      throw err;
    }
  };

  const signInWithEmailOtp = async (email: string) => {
    const trimmedEmail = email.trim();
    if (!isSupabaseConfigured) {
      await signInAsDemo(trimmedEmail.toLowerCase().includes('mentor') ? 'mentor' : 'student');
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });
      if (error) {
        return { error: error.message };
      }
      if (data?.url) {
        try {
          const probe = await fetch(data.url, { method: 'GET' });
          if (!probe.ok) {
            const probeJson = await probe.json().catch(() => ({}));
            if (probeJson.msg?.includes('provider is not enabled') || probe.status === 400) {
              return {
                error: 'Google OAuth provider is not yet enabled in your Supabase project. You can sign in right away using Email/Password (e.g. student@syllabix.edu) or click One-Click Demo Student below.',
              };
            }
          }
        } catch {
          // In case CORS blocks probe fetch, proceed with redirect
        }
        window.location.href = data.url;
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Failed to initialize Google OAuth' };
    }
  };

  const signInAsDemo = async (role: 'student' | 'mentor' = 'student') => {
    const isMentor = role === 'mentor';
    const mockUser: SupabaseUser = {
      id: isMentor ? 'demo-mentor-id-001' : 'demo-student-id-001',
      app_metadata: { provider: 'demo' },
      user_metadata: {
        full_name: isMentor ? 'Prof. Aryan Sharma (Mentor)' : 'Aarav Mehta (Student)',
        role: isMentor ? 'mentor' : 'student',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: isMentor ? 'mentor@syllabix.edu' : 'student@syllabix.edu',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: isMentor ? 'demo-mentor-bearer-token' : 'demo-bearer-token',
      token_type: 'bearer',
      expires_in: 86400,
      expires_at: Math.floor(Date.now() / 1000) + 86400,
      refresh_token: 'demo-refresh-token',
      user: mockUser,
    };

    const mockProfile: User = {
      _id: isMentor ? 'demo_mentor_profile' : 'demo_user_profile',
      supabaseUserId: mockUser.id,
      email: mockUser.email!,
      name: mockUser.user_metadata.full_name,
      role: role,
      reputationPoints: isMentor ? 240 : 120,
    };

    localStorage.setItem(
      'syllabix_demo_session',
      JSON.stringify({ session: mockSession, profile: mockProfile })
    );

    setSession(mockSession);
    setSupabaseUser(mockUser);
    setProfile(mockProfile);
  };

  const signOut = async () => {
    // 1. Clear local demo session immediately
    localStorage.removeItem('syllabix_demo_session');

    // 2. Clear any Supabase tokens in localStorage
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    // 3. Immediately clear state so UI updates to logged-out state instantaneously
    setSession(null);
    setSupabaseUser(null);
    setProfile(null);

    // 4. Remote Supabase sign out (non-blocking)
    try {
      await supabase.auth.signOut();
    } catch {
      // Safe to ignore remote sign-out failures
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        supabaseUser,
        profile,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signInWithEmailOtp,
        signInWithGoogle,
        signInAsDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
