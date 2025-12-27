import { query } from '../config/database.js';

export class UserModel {
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const result = await query(sql, [name, email, password, role]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0] || null;
  }

  static async findById(id) {
    const sql = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findAll() {
    const sql = 'SELECT id, name, email, role, created_at, updated_at FROM users';
    return await query(sql);
  }

  static async update(id, userData) {
    const { name, email, role } = userData;
    const sql = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
    const result = await query(sql, [name, email, role, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async emailExists(email) {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const results = await query(sql, [email]);
    return results[0].count > 0;
  }
}
