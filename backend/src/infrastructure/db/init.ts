import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../../adapters/outbound/postgres/db.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  const seeds = await fs.readFile(path.join(__dirname, 'seeds.sql'), 'utf8');
  await pool.query(schema);
  await pool.query(seeds);
  await pool.end();
  console.log('Database initialized');
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
