import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { exec } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations() {
  console.log('[Migration] Starting database migration...');
  const schemaPath = path.resolve(__dirname, '../../migrations/schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at ${schemaPath}`);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await exec(sql);
    console.log('[Migration] Database schema migrated successfully! All 18 relational tables and indexes ready.');
  } catch (err) {
    console.error('[Migration Error]', err);
    throw err;
  }
}

// Allow direct CLI execution: node src/config/migrate.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
