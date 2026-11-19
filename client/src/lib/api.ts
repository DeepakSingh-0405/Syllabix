import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api/v1';

/**
 * Retrieves the active authentication bearer token, checking both Supabase Auth session
 * and local demo session storage with expiration validation.
 */
export async function getAuthToken(): Promise<string | null> {
  // 1. Check active Supabase session
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return session.access_token;
    }
  } catch {
    // Supabase offline / error fallback
  }

  // 2. Check local demo session if available
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const savedDemo = localStorage.getItem('syllabix_demo_session');
      if (savedDemo) {
        const parsed = JSON.parse(savedDemo);
        if (parsed?.session?.access_token) {
          const expiresAt = parsed.session.expires_at;
          if (expiresAt && Date.now() / 1000 > expiresAt) {
            localStorage.removeItem('syllabix_demo_session');
            return null;
          }
          return parsed.session.access_token;
        }
      }
    } catch {
      // Corrupted JSON in localStorage
    }
  }

  return null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();
  if (!response.ok) {
    const errorMsg = typeof json.error === 'string'
      ? json.error
      : (json.error?.message || json.message || `HTTP Error ${response.status}`);
    throw new Error(errorMsg);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: any) => request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
