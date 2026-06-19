const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://postgres.dfeflahipqmfwsttsjed:mehdi2020mhhm@aws-0-eu-west-1.pooler.supabase.com:6543/postgres',
  });

  await client.connect();
  console.log('Connected to database');

  const columns = [
    { name: 'volume', type: 'VARCHAR(100)' },
    { name: '"ingredients"', type: 'TEXT' },
    { name: '"topNotes"', type: 'VARCHAR(255)' },
    { name: '"heartNotes"', type: 'VARCHAR(255)' },
    { name: '"baseNotes"', type: 'VARCHAR(255)' },
  ];

  for (const col of columns) {
    try {
      await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      console.log(`Added column ${col.name}`);
    } catch (err) {
      console.log(`Column ${col.name} might already exist: ${err.message}`);
    }
  }

  await client.end();
  console.log('Done!');
}

main().catch(console.error);
