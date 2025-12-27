// Simple MySQL connection-pool helper for the app.
//
// This module uses the `config.db` values (see `backend/config/env.config.js`)
// which are loaded from environment variables (DB_HOST, DB_USER, DB_PASSWORD,
// DB_NAME, DB_PORT) or their defaults.
//
// Exports:
// - createPool(): initialize (once) and return the MySQL pool
// - getConnection(): get a single connection from the pool (use .release() when done)
// - query(sql, params): convenience helper to execute parameterized queries
import mysql from 'mysql2/promise';
import { config } from './env.config.js';

// Singleton pool instance reused across the app to avoid creating
// multiple connection pools on repeated requests.
let pool;

export const createPool = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Note: connectionLimit controls the maximum number of connections
    // in the pool. Adjust this (and other pool settings) as needed for
    // your deployment and load characteristics.
    console.log('✅ MySQL connection pool created');
  }
  return pool;
};

export const getConnection = async () => {
  if (!pool) {
    createPool();
  }
  // Returns a connection from the pool. Caller should call `connection.release()`
  // when finished with the connection to return it to the pool.
  return await pool.getConnection();
};

/**
 * Execute a parameterized query using the pool.
 * @param {string} sql - SQL statement with `?` placeholders
 * @param {Array} params - Parameters to bind to placeholders
 * @returns {Promise<Array>} - Result rows
 */
export const query = async (sql, params) => {
  if (!pool) {
    createPool();
  }
  const [results] = await pool.execute(sql, params);
  return results;
};

export default { createPool, getConnection, query };
