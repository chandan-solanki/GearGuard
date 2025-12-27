import { query } from '../config/database.js';

export class TechnicianModel {
  static async create(technicianData) {
    const { user_id, team_id } = technicianData;
    const sql = `
      INSERT INTO technicians (user_id, team_id)
      VALUES (?, ?)
    `;
    const result = await query(sql, [user_id, team_id]);
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT t.*, u.name, u.email, u.role, mt.name as team_name, 
             d.name as department_name
      FROM technicians t
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN maintenance_teams mt ON t.team_id = mt.id
      INNER JOIN departments d ON mt.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.team_id) {
      sql += ' AND t.team_id = ?';
      params.push(filters.team_id);
    }

    if (filters.department_id) {
      sql += ' AND mt.department_id = ?';
      params.push(filters.department_id);
    }

    sql += ' ORDER BY u.name ASC';

    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 10;
      const offset = parseInt(filters.offset, 10) || 0;
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT t.*, u.name, u.email, u.role, mt.name as team_name,
             d.name as department_name, d.id as department_id
      FROM technicians t
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN maintenance_teams mt ON t.team_id = mt.id
      INNER JOIN departments d ON mt.department_id = d.id
      WHERE t.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT t.*, u.name, u.email, u.role, mt.name as team_name
      FROM technicians t
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN maintenance_teams mt ON t.team_id = mt.id
      WHERE t.user_id = ?
    `;
    const results = await query(sql, [userId]);
    return results[0] || null;
  }

  static async update(id, technicianData) {
    const { team_id } = technicianData;
    const sql = 'UPDATE technicians SET team_id = ? WHERE id = ?';
    await query(sql, [team_id, id]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM technicians WHERE id = ?';
    await query(sql, [id]);
  }

  static async deleteByUserId(userId) {
    const sql = 'DELETE FROM technicians WHERE user_id = ?';
    await query(sql, [userId]);
  }
}
