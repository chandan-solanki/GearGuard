import mysql from 'mysql2/promise';
import { config } from './env.config.js';

export const initDatabase = async () => {
  let connection;
  try {
    console.log('🔄 Checking database setup...');
    
    // Connect without specifying a database
    connection = await mysql.createConnection({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      port: config.db.port,
    });
    
    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.db.database}`);
    console.log('✅ Database created/verified');
    
    // Switch to the database
    await connection.query(`USE ${config.db.database}`);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');
    
    // Create tasks table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tasks table created/verified');
    
    // Create indexes (ignore if already exists)
    try {
      await connection.query(`CREATE INDEX idx_user_email ON users(email)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
    }
    
    try {
      await connection.query(`CREATE INDEX idx_task_user_id ON tasks(user_id)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
    }
    
    try {
      await connection.query(`CREATE INDEX idx_task_status ON tasks(status)`);
    } catch (err) {
      if (err.code !== 'ER_DUP_KEYNAME') throw err;
    }
    console.log('✅ Indexes created/verified');
    
    console.log('✅ Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
