import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.VITE_SUPABASE_ANO || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_ANO) are missing. Please add them in the Secrets panel in AI Studio UI.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
