import { query } from '../config/database.js';

export class MaintenanceTeamModel {
  static async create(teamData) {
    const { name, department_id } = teamData;
    const sql = `
      INSERT INTO maintenance_teams (name, department_id)
      VALUES (?, ?)
    `;
    const result = await query(sql, [name, department_id]);
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT mt.*, d.name as department_name
      FROM maintenance_teams mt
      INNER JOIN departments d ON mt.department_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.department_id) {
      sql += ' AND mt.department_id = ?';
      params.push(filters.department_id);
    }

    if (filters.search) {
      sql += ' AND mt.name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY mt.name ASC';

    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 10;
      const offset = parseInt(filters.offset, 10) || 0;
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT mt.*, d.name as department_name
      FROM maintenance_teams mt
      INNER JOIN departments d ON mt.department_id = d.id
      WHERE mt.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async update(id, teamData) {
    const { name, department_id } = teamData;
    const sql = `
      UPDATE maintenance_teams
      SET name = ?, department_id = ?
      WHERE id = ?
    `;
    await query(sql, [name, department_id, id]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM maintenance_teams WHERE id = ?';
    await query(sql, [id]);
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM maintenance_teams WHERE 1=1';
    const params = [];

    if (filters.department_id) {
      sql += ' AND department_id = ?';
      params.push(filters.department_id);
    }

    const results = await query(sql, params);
    return results[0].total;
  }

  static async getTechnicians(teamId) {
    const sql = `
      SELECT t.*, u.name, u.email
      FROM technicians t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.team_id = ?
    `;
    return await query(sql, [teamId]);
  }
}
