import { query } from '../config/database.js';

export class MaintenanceLogModel {
  static async create(logData) {
    const { request_id, old_status, new_status, changed_by, notes } = logData;

    const sql = `
      INSERT INTO maintenance_logs (request_id, old_status, new_status, changed_by, notes)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      request_id,
      old_status || null,
      new_status,
      changed_by || null,
      notes || null,
    ]);

    return result.insertId;
  }

  static async findByRequestId(requestId) {
    const sql = `
      SELECT ml.*, u.name as changed_by_name
      FROM maintenance_logs ml
      LEFT JOIN users u ON ml.changed_by = u.id
      WHERE ml.request_id = ?
      ORDER BY ml.changed_at DESC
    `;
    return await query(sql, [requestId]);
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT ml.*, 
             u.name as changed_by_name,
             mr.subject as request_subject
      FROM maintenance_logs ml
      LEFT JOIN users u ON ml.changed_by = u.id
      INNER JOIN maintenance_requests mr ON ml.request_id = mr.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.request_id) {
      sql += ' AND ml.request_id = ?';
      params.push(filters.request_id);
    }

    sql += ' ORDER BY ml.changed_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    return await query(sql, params);
  }
}
