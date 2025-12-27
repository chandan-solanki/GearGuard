import { query } from '../config/database.js';

export class UserModel {
  static async create(userData) {
    const { name, email, password, role = 'employee' } = userData;
    const sql = 'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)';
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

  static async findByIdWithPassword(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT id, name, email, role, created_at, updated_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY name ASC';

    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    return await query(sql, params);
  }

  static async update(id, userData) {
    const fields = [];
    const params = [];

    if (userData.name) {
      fields.push('name = ?');
      params.push(userData.name);
    }

    if (userData.email) {
      fields.push('email = ?');
      params.push(userData.email);
    }

    if (userData.role) {
      fields.push('role = ?');
      params.push(userData.role);
    }

    if (userData.password) {
      fields.push('password_hash = ?');
      params.push(userData.password);
    }

    if (fields.length === 0) return false;

    params.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const result = await query(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async emailExists(email, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const params = [email];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const results = await query(sql, params);
    return results[0].count > 0;
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    const results = await query(sql, params);
    return results[0].total;
  }
}

