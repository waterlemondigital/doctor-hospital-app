import { query } from '../dist/db/postgres.js';

async function check() {
  const tables = ['users', 'hospitals', 'laboratories', 'wellness_centers', 'portal_accounts', 'patient_leads'];
  for (const t of tables) {
    const res = await query(
      'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position',
      [t]
    );
    console.log(`\n=== ${t} ===`);
    res.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type}`));
  }
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
