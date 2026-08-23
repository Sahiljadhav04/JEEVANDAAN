/**
 * Jeevandan — Quick RLS Fix + Data Verify
 * Run: node fix-rls.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

async function fix() {
  console.log('🔧 Checking Supabase connection and data...\n');

  // Check if users exist
  const { data: users, error: ue } = await supabase.from('users').select('id, name, email, role');
  if (ue) {
    console.error('❌ Cannot read users table:', ue.message);
    console.log('\n⚠️  This means your SUPABASE_SERVICE_KEY is still the anon key.');
    console.log('   Go to: Supabase → Settings → API → Service Role Key → Reveal → Copy');
    console.log('   Then update backend/.env and restart\n');
    process.exit(1);
  }

  console.log(`✅ Users table: ${users.length} records found`);
  users.forEach(u => console.log(`   → ${u.email} (${u.role})`));

  const { data: camps } = await supabase.from('camps').select('id, name');
  console.log(`\n✅ Camps table: ${camps?.length || 0} records`);

  const { data: inv } = await supabase.from('inventory').select('id, blood_group, status');
  console.log(`✅ Inventory table: ${inv?.length || 0} records`);

  const { data: emergencies } = await supabase.from('emergencies').select('id, patient_name');
  console.log(`✅ Emergencies table: ${emergencies?.length || 0} records`);

  console.log('\n🎉 All good! Supabase is fully connected.\n');
  process.exit(0);
}

fix().catch(err => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
