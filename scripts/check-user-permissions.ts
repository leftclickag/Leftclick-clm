/**
 * Debug-Script: Prüft Benutzer-Berechtigungen
 * 
 * Ausführen mit: npx tsx scripts/check-user-permissions.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Fehlende Umgebungsvariablen!');
  console.error('Benötigt: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserPermissions() {
  console.log('🔍 Überprüfe Benutzer-Berechtigungen...\n');

  // 1. Alle Benutzer anzeigen
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, role, tenant_id')
    .order('created_at', { ascending: false });

  if (usersError) {
    console.error('❌ Fehler beim Laden der Benutzer:', usersError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('⚠️ Keine Benutzer gefunden!');
    return;
  }

  console.log(`📊 Gefundene Benutzer: ${users.length}\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email}`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Rolle: ${user.role || '❌ NICHT GESETZT'}`);
    console.log(`   - Tenant ID: ${user.tenant_id || '❌ NICHT GESETZT'}`);
    console.log('');
  });

  // 2. Rollen-Berechtigungen anzeigen
  console.log('\n📋 Custom Rollen-Berechtigungen:\n');

  const { data: rolePerms, error: rolePermsError } = await supabase
    .from('role_permissions')
    .select('*');

  if (rolePermsError) {
    console.error('❌ Fehler beim Laden der Rollen-Berechtigungen:', rolePermsError);
  } else if (!rolePerms || rolePerms.length === 0) {
    console.log('✅ Keine custom Berechtigungen gesetzt (verwendet Standard-Berechtigungen)');
  } else {
    rolePerms.forEach((perm) => {
      console.log(`- ${perm.role}: ${perm.permissions.length} Berechtigungen`);
    });
  }

  // 3. Empfehlungen
  console.log('\n💡 Empfehlungen:\n');

  const superAdmins = users.filter(u => u.role === 'super_admin');
  if (superAdmins.length === 0) {
    console.log('⚠️ KEIN Super Admin gefunden!');
    console.log('   Führen Sie aus:');
    console.log('   UPDATE users SET role = \'super_admin\' WHERE email = \'ihre-email@example.com\';');
    console.log('');
  } else {
    console.log(`✅ ${superAdmins.length} Super Admin(s) gefunden`);
  }

  const usersWithoutTenant = users.filter(u => !u.tenant_id);
  if (usersWithoutTenant.length > 0) {
    console.log(`\n⚠️ ${usersWithoutTenant.length} Benutzer ohne Tenant ID:`);
    usersWithoutTenant.forEach(u => {
      console.log(`   - ${u.email}`);
    });
    console.log('   Dies könnte zu Problemen führen!');
  }

  const usersWithoutRole = users.filter(u => !u.role);
  if (usersWithoutRole.length > 0) {
    console.log(`\n⚠️ ${usersWithoutRole.length} Benutzer ohne Rolle:`);
    usersWithoutRole.forEach(u => {
      console.log(`   - ${u.email}`);
    });
  }
}

checkUserPermissions()
  .then(() => {
    console.log('\n✅ Prüfung abgeschlossen');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fehler:', error);
    process.exit(1);
  });


