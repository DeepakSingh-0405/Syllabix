import { createClient } from '@supabase/supabase-js';

const clientEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (process.env as any || {});
const supabaseUrl = clientEnv.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = clientEnv.VITE_SUPABASE_ANON_KEY || 'sb_mock_anon_key';

export const isSupabaseConfigured = Boolean(
  clientEnv.VITE_SUPABASE_URL && clientEnv.VITE_SUPABASE_ANON_KEY
);

if (!isSupabaseConfigured && clientEnv.DEV) {
  console.info('[Supabase] Running in local demo/mock mode without remote Supabase configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKETS = {
  ACADEMIC_DOCUMENTS: 'academic-documents',
  PUBLIC_ASSETS: 'public-assets',
} as const;
