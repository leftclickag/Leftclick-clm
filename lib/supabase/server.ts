import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  // DEBUG: Server-Side Umgebungsvariablen prüfen
  // console.log('🔍 SERVER CLIENT DEBUG:');
  // console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  // console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Parameters<typeof cookieStore.set>[2];
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export function createAdminClient() {
  const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Bessere Fehlerbehandlung mit Debug-Ausgabe
  if (!url) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL ist nicht definiert");
    throw new Error("NEXT_PUBLIC_SUPABASE_URL ist nicht definiert. Bitte fügen Sie es zu Ihrer .env.local Datei hinzu.");
  }
  
  if (!adminKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY ist nicht definiert");
    console.error("📋 So beheben Sie das Problem:");
    console.error("1. Gehen Sie zu Ihrem Supabase Dashboard");
    console.error("2. Projekt Settings > API");
    console.error("3. Kopieren Sie den 'service_role' Key (nicht den 'anon' Key!)");
    console.error("4. Fügen Sie SUPABASE_SERVICE_ROLE_KEY=ihr-key zur .env.local Datei hinzu");
    throw new Error("SUPABASE_SERVICE_ROLE_KEY ist nicht definiert. Bitte fügen Sie es zu Ihrer .env.local Datei hinzu.");
  }

  console.log("✅ Admin Client wird erstellt mit URL:", url.substring(0, 30) + "...");
  console.log("✅ Service Role Key:", adminKey.substring(0, 20) + "..." + adminKey.substring(adminKey.length - 5));

  return createSupabaseClient(
    url,
    adminKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

