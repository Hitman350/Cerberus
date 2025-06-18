// src/dal/postgres.js
import pg from 'pg';
import { config } from '../config/index.js';

const { Pool } = pg;

// This is our singleton pool instance. It starts as null.
let pool = null;

/**
 * Returns a singleton instance of the PostgreSQL connection pool.
 * It creates the pool on the first call and returns the existing pool
 * on all subsequent calls.
 * @returns {pg.Pool} The connected PostgreSQL pool instance.
 */
const getPool = () => {
  // If the pool hasn't been created yet, create it now.
  if (!pool) {
    console.log('--- Creating new PostgreSQL connection pool ---'); // A log to see this happens only once.
    pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl:
        config.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });

    pool.on('connect', () => {
      console.log('🔗 Connected to PostgreSQL database!');
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(-1);
    });
  }
  return pool;
};

/**
 * A centralized query function that uses the singleton pool.
 * @param {string} text - The SQL query string.
 * @param {Array} params - The parameters for the query.
 * @returns {Promise<pg.QueryResult>}
 */
export const query = (text, params) => {
  const dbPool = getPool();
  return dbPool.query(text, params);
};

// We still export the getPool function in case we need to end it, like in tests.
export default getPool;