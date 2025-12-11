import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  // Prüfe ob die Keys unterschiedlich sind
  const keysAreDifferent = anonKey && serviceKey && anonKey !== serviceKey;
  const keyWarning = !keysAreDifferent && anonKey && serviceKey 
    ? "⚠️ WARNUNG: Anon Key und Service Role Key sind identisch! Das ist FALSCH!"
    : null;

  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Gesetzt" : "❌ Fehlt",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Gesetzt" : "❌ Fehlt",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Gesetzt" : "❌ Fehlt",
      keysAreDifferent: keysAreDifferent ? "✅ Keys sind unterschiedlich" : "❌ Keys sind identisch oder fehlen",
      anonKeyLength: anonKey ? `${anonKey.length} Zeichen` : "0",
      serviceKeyLength: serviceKey ? `${serviceKey.length} Zeichen` : "0",
      warning: keyWarning,
    },
    tests: {
      adminClientCreation: "❌ Nicht getestet",
      databaseAccess: "❌ Nicht getestet",
      authAdminAccess: "❌ Nicht getestet",
    },
    error: null,
    solution: null,
  };

  // Test 1: Admin Client erstellen
  let adminClient;
  try {
    adminClient = createAdminClient();
    diagnostics.tests.adminClientCreation = "✅ Erfolgreich";
  } catch (error: any) {
    diagnostics.tests.adminClientCreation = "❌ Fehlgeschlagen";
    diagnostics.error = error.message;
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // Test 2: Datenbank-Zugriff testen
  try {
    const { data, error } = await adminClient
      .from("user_roles")
      .select("*", { count: "exact", head: true });
    
    if (error) {
      diagnostics.tests.databaseAccess = `❌ Fehlgeschlagen: ${error.message}`;
      diagnostics.error = error.message;
    } else {
      diagnostics.tests.databaseAccess = "✅ Erfolgreich";
    }
  } catch (error: any) {
    diagnostics.tests.databaseAccess = `❌ Exception: ${error.message}`;
    diagnostics.error = error.message;
  }

  // Test 3: Auth Admin Zugriff testen
  try {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    
    if (error) {
      diagnostics.tests.authAdminAccess = `❌ Fehlgeschlagen: ${error.message}`;
      if (!diagnostics.error) {
        diagnostics.error = `Auth Admin: ${error.message}`;
      }
    } else {
      diagnostics.tests.authAdminAccess = `✅ Erfolgreich (${data.users.length} Benutzer gefunden)`;
    }
  } catch (error: any) {
    diagnostics.tests.authAdminAccess = `❌ Exception: ${error.message}`;
    if (!diagnostics.error) {
      diagnostics.error = error.message;
    }
  }

  // Lösungsvorschlag basierend auf den Ergebnissen
  if (diagnostics.error) {
    if (diagnostics.error.includes("Invalid authentication credentials")) {
      diagnostics.solution = {
        problem: "Der SUPABASE_SERVICE_ROLE_KEY ist ungültig",
        steps: [
          "1. Gehen Sie zu https://supabase.com und öffnen Sie Ihr Projekt",
          "2. Klicken Sie auf Settings (⚙️) → API",
          "3. Scrollen Sie zu 'Project API keys'",
          "4. Kopieren Sie den KEY bei 'service_role' (NICHT 'anon public'!)",
          "5. Ersetzen Sie SUPABASE_SERVICE_ROLE_KEY in .env.local",
          "6. Starten Sie den Server neu (Ctrl+C, dann npm run dev)",
        ],
        note: "⚠️ Der service_role Key ist VIEL LÄNGER als der anon Key und beginnt anders!"
      };
    } else {
      diagnostics.solution = {
        problem: "Datenbank-Verbindungsfehler",
        steps: [
          "1. Prüfen Sie die Supabase-URL",
          "2. Stellen Sie sicher, dass die Tabelle 'user_roles' existiert",
          "3. Führen Sie die Migrations aus",
        ]
      };
    }
  }

  const status = diagnostics.error ? 500 : 200;
  return NextResponse.json(diagnostics, { status });
}

