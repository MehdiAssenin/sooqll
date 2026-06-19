import postgres from 'postgres';

const sql = postgres('postgresql://postgres.dfeflahipqmfwsttsjed:mehdi2020mhhm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres', { prepare: false });

async function main() {
  console.log('Connected to database');

  const columns = [
    { name: 'volume', type: 'VARCHAR(100)' },
    { name: 'ingredients', type: 'TEXT' },
    { name: '"topNotes"', type: 'VARCHAR(255)' },
    { name: '"heartNotes"', type: 'VARCHAR(255)' },
    { name: '"baseNotes"', type: 'VARCHAR(255)' },
  ];

  for (const col of columns) {
    try {
      await sql.unsafe(`ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      console.log(`✓ Added column ${col.name}`);
    } catch (err) {
      console.log(`Column ${col.name} might already exist: ${err.message}`);
    }
  }

  await sql.end();
  console.log('Done!');
}

main().catch(console.error);
