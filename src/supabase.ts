import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.VITE_SUPABASE_ANO || '';

// Clean up Supabase URL to handle dashboard copy-pastes, trailing paths, and spaces
export function cleanSupabaseUrl(url: string): string {
  let clean = url.trim();
  if (!clean) return '';

  // Case 1: User pasted the Supabase Dashboard URL by accident
  // e.g., https://supabase.com/dashboard/project/abcde-ref-here/editor or similar
  const dashboardMatch = clean.match(/supabase\.com\/dashboard\/project\/([a-zA-Z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // Case 2: Clean up common subpaths like /rest/v1 or /auth/v1 if users included them
  clean = clean.replace(/\/(rest|auth)\/v\d+\/?$/i, '');

  // Case 3: Standardize protocol and strip trailing slashes
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  clean = clean.replace(/\/+$/, '');

  return clean;
}

const cleanedUrl = cleanSupabaseUrl(rawUrl);

// If variables are missing or obviously invalid, toggle configuration status
export const isSupabaseConfigured = Boolean(cleanedUrl && rawKey && rawKey.length > 20);

const supabaseUrl = isSupabaseConfigured ? cleanedUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey.trim() : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

