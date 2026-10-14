import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

let dbInstance = null;
let isEmbedded = false;

// If explicitly using real Postgres with DATABASE_URL or PGHOST (and not in fallback mode)
const useRealPostgres = process.env.DATABASE_URL || (process.env.USE_PGLITE === 'false' && process.env.PGHOST);

if (useRealPostgres) {
  try {
    const { Pool } = pg;
    const config = process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432', 10),
          database: process.env.PGDATABASE || 'collabcampus',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        };

    const pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]', err);
    });

    dbInstance = {
      isEmbedded: false,
      query: (text, params) => pool.query(text, params),
      exec: (sql) => pool.query(sql),
      getClient: () => pool.connect(),
      end: () => pool.end(),
      pool,
    };
    console.log('[Database] Configured PostgreSQL native Pool connection');
  } catch (err) {
    console.warn('[Database] Native PostgreSQL pool connection failed, falling back to embedded PG:', err.message);
  }
}

if (!dbInstance) {
  // Ultra-reliable embedded PostgreSQL emulator powered by pg-mem
  const { newDb } = await import('pg-mem');
  const memDb = newDb();

  // Register common Postgres functions if needed
  memDb.public.registerFunction({
    name: 'now',
    returns: memDb.public.getType('timestamp with time zone') || memDb.public.getType('timestamp'),
    implementation: () => new Date(),
  });

  const { Pool: MemPool } = memDb.adapters.createPg();
  const pool = new MemPool();
  isEmbedded = true;

  dbInstance = {
    isEmbedded: true,
    query: (text, params) => pool.query(text, params),
    exec: (sql) => pool.query(sql),
    getClient: () => pool.connect(),
    end: () => pool.end(),
    pool,
    memDb,
  };
  console.log('[Database] Initialized embedded PostgreSQL (pg-mem) with full relational capabilities');
}

export const query = (text, params) => dbInstance.query(text, params);
export const exec = (sql) => dbInstance.exec(sql);
export const getClient = () => dbInstance.getClient();
export const isUsingPgLite = () => isEmbedded;
export const isEmbeddedDb = () => isEmbedded;
export default dbInstance;
