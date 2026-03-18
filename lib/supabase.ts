import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'siteflow-auth-token',
      // @ts-ignore - Supabase JS v2 typings don't fully expose cookieOptions on createClient, but auth-helpers expects custom storage if used this way. We use default storage for now but set secure cookie config where applicable if using @supabase/ssr.
      cookieOptions: {
        name: 'sb-siteflow-auth-token',
        secure: true, // Always force secure cookies for mobile PWA
        sameSite: 'lax',
      },
    },
  }
);
