// Test-Script für Supabase Admin Client
// Führe aus mit: node test-supabase-admin.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lade .env.local manuell
const envPath = path.join(__dirname, '.env.local');
let url, serviceRoleKey;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        url = value;
      } else if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
        serviceRoleKey = value;
      }
    }
  });
}

console.log('🔍 Überprüfe Supabase Admin Konfiguration...\n');

// 1. Prüfe ob Variablen gesetzt sind
console.log('NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Gesetzt' : '❌ FEHLT');
console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅ Gesetzt' : '❌ FEHLT');

if (!url || !serviceRoleKey) {
  console.error('\n❌ Umgebungsvariablen fehlen!');
  process.exit(1);
}

// 2. Prüfe Key-Format
console.log('\n📋 Key-Format-Prüfung:');
console.log('URL beginnt mit https:', url.startsWith('https://') ? '✅' : '❌');
console.log('URL enthält supabase:', url.includes('supabase') ? '✅' : '❌');
console.log('Service Key beginnt mit eyJ:', serviceRoleKey.startsWith('eyJ') ? '✅' : '❌');
console.log('Service Key Länge:', serviceRoleKey.length, serviceRoleKey.length > 200 ? '✅' : '⚠️ Scheint kurz');

// 3. Teste Admin Client
console.log('\n🔧 Teste Admin Client...');
const adminClient = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 4. Teste eine einfache Admin-Operation
console.log('📝 Teste Zugriff auf invite_codes Tabelle...');
adminClient
  .from('invite_codes')
  .select('count')
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Fehler beim Zugriff:', error.message);
      console.error('   Status:', error.status);
      console.error('   Code:', error.code);
      
      if (error.message.includes('authentication') || error.message.includes('credentials')) {
        console.error('\n💡 Lösung: Der SUPABASE_SERVICE_ROLE_KEY ist ungültig oder falsch.');
        console.error('   1. Gehe zu Supabase Dashboard → Project Settings → API');
        console.error('   2. Kopiere den "service_role" Key (nicht "anon"!)');
        console.error('   3. Ersetze SUPABASE_SERVICE_ROLE_KEY in .env.local');
      }
    } else {
      console.log('✅ Admin Client funktioniert!');
      console.log('   Anzahl Invite Codes in DB:', data);
    }
  })
  .catch((err) => {
    console.error('❌ Unerwarteter Fehler:', err);
  });

