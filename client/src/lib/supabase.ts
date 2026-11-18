import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_mock_anon_key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info('[Supabase] Running in local demo/mock mode without remote Supabase configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const BUCKETS = {
  ACADEMIC_DOCUMENTS: 'academic-documents',
  PUBLIC_ASSETS: 'public-assets',
} as const;
