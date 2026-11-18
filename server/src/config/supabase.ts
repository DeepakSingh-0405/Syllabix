import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';

const targetUrl = env.SUPABASE_URL || 'http://127.0.0.1:54321';
const targetServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || 'sb_mock_service_role_key';
const targetAnonKey = env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY || 'sb_mock_anon_key';

if (!isSupabaseConfigured && env.NODE_ENV !== 'test') {
  console.warn(
    '[Supabase/Security] Remote SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured. Running in offline/mock mode.'
  );
}

// Admin client for backend operations (verifying tokens, creating signed storage URLs)
export const supabaseAdmin: SupabaseClient = createClient(targetUrl, targetServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Standard client for public / general queries
export const supabasePublic: SupabaseClient = createClient(targetUrl, targetAnonKey);

export const BUCKETS = {
  ACADEMIC_DOCUMENTS: 'academic-documents',
  PUBLIC_ASSETS: 'public-assets',
} as const;
