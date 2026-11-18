import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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

  const fetchProfile = async () => {
    try {
      const data = await api.get<User>('/users/me');
      setProfile(data);
    } catch {
      // Backend offline or fallback
      if (session?.user) {
        setProfile({
          _id: 'local_user',
          supabaseUserId: session.user.id,
          email: session.user.email || 'student@syllabix.edu',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
          role: 'student',
          reputationPoints: 25,
        });
      }
    }
  };

  useEffect(() => {
    // 1. Check local demo session first
    const savedDemo = localStorage.getItem('syllabix_demo_session');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setSession(parsed.session);
        setSupabaseUser(parsed.session.user);
        setProfile(parsed.profile);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem('syllabix_demo_session');
      }
    }

    // 2. Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session) {
        fetchProfile();
      }
      setLoading(false);
    });

    // 3. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session) {
        fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setSession(data.session);
    setSupabaseUser(data.user);
    await fetchProfile();
  };

  const signUpWithPassword = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    if (error) throw error;
    if (data.session) {
      setSession(data.session);
      setSupabaseUser(data.user);
      await fetchProfile();
    }
  };

  const signInWithEmailOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
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
    const mockUser: SupabaseUser = {
      id: 'demo-student-id-001',
      app_metadata: { provider: 'demo' },
      user_metadata: { full_name: role === 'mentor' ? 'Prof. Aryan Sharma (Mentor)' : 'Aarav Mehta (Student)' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: role === 'mentor' ? 'mentor@syllabix.edu' : 'student@syllabix.edu',
      phone: '',
      role: 'authenticated',
      updated_at: new Date().toISOString(),
    };

    const mockSession: Session = {
      access_token: 'demo-bearer-token',
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'demo-refresh-token',
      user: mockUser,
    };

    const mockProfile: User = {
      _id: 'demo_user_profile',
      supabaseUserId: mockUser.id,
      email: mockUser.email!,
      name: mockUser.user_metadata.full_name,
      role: role,
      reputationPoints: role === 'mentor' ? 240 : 45,
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
    localStorage.removeItem('syllabix_demo_session');
    await supabase.auth.signOut().catch(() => {});
    setSession(null);
    setSupabaseUser(null);
    setProfile(null);
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
