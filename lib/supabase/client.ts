import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // DEBUG nur einmal loggen
  if (typeof window !== 'undefined' && !(window as any).__supabaseClientDebugLogged) {
    console.log('🔍 CLIENT DEBUG:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
    (window as any).__supabaseClientDebugLogged = true;
  }

  // createBrowserClient verwendet automatisch Cookies wenn keine custom storage angegeben
  // Das ist das Standard-Verhalten von @supabase/ssr
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

