import mysql from 'mysql2/promise';
import { config } from './env.config.js';

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

    console.log('✅ MySQL connection pool created');
  }
  return pool;
};

export const getConnection = async () => {
  if (!pool) {
    createPool();
  }
  return await pool.getConnection();
};

export const query = async (sql, params) => {
  if (!pool) {
    createPool();
  }
  const [results] = await pool.execute(sql, params);
  return results;
};

export default { createPool, getConnection, query };
