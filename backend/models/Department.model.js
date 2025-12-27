import { query } from '../config/database.js';

export class DepartmentModel {
  static async create(departmentData) {
    const { name, description } = departmentData;
    const sql = `
      INSERT INTO departments (name, description)
      VALUES (?, ?)
    `;
    const result = await query(sql, [name, description || null]);
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM departments WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY name ASC';

    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 10;
      const offset = parseInt(filters.offset, 10) || 0;
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    return await query(sql, params);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM departments WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async update(id, departmentData) {
    const { name, description } = departmentData;
    const sql = `
      UPDATE departments
      SET name = ?, description = ?
      WHERE id = ?
    `;
    await query(sql, [name, description, id]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM departments WHERE id = ?';
    await query(sql, [id]);
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM departments WHERE 1=1';
    const params = [];

    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const results = await query(sql, params);
    return results[0].total;
  }
}
