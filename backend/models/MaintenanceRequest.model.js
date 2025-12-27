import { query } from '../config/database.js';

export class MaintenanceRequestModel {
  static async create(requestData) {
    const {
      subject,
      type,
      description,
      equipment_id,
      department_id,
      team_id,
      technician_id,
      scheduled_date,
      created_by,
    } = requestData;

    const sql = `
      INSERT INTO maintenance_requests (
        subject, type, description, equipment_id, department_id,
        team_id, technician_id, scheduled_date, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      subject,
      type,
      description || null,
      equipment_id,
      department_id,
      team_id,
      technician_id || null,
      scheduled_date || null,
      created_by,
    ]);

    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT mr.*,
             e.name as equipment_name, e.serial_number,
             d.name as department_name,
             mt.name as team_name,
             u.name as created_by_name,
             t.id as technician_id,
             tu.name as technician_name,
             CASE 
               WHEN mr.scheduled_date < NOW() AND mr.status NOT IN ('repaired', 'scrap')
               THEN 1 ELSE 0
             END as is_overdue
      FROM maintenance_requests mr
      INNER JOIN equipment e ON mr.equipment_id = e.id
      INNER JOIN departments d ON mr.department_id = d.id
      INNER JOIN maintenance_teams mt ON mr.team_id = mt.id
      INNER JOIN users u ON mr.created_by = u.id
      LEFT JOIN technicians t ON mr.technician_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.equipment_id) {
      sql += ' AND mr.equipment_id = ?';
      params.push(filters.equipment_id);
    }

    if (filters.department_id) {
      sql += ' AND mr.department_id = ?';
      params.push(filters.department_id);
    }

    if (filters.team_id) {
      sql += ' AND mr.team_id = ?';
      params.push(filters.team_id);
    }

    if (filters.technician_id) {
      sql += ' AND mr.technician_id = ?';
      params.push(filters.technician_id);
    }

    if (filters.status) {
      sql += ' AND mr.status = ?';
      params.push(filters.status);
    }

    if (filters.type) {
      sql += ' AND mr.type = ?';
      params.push(filters.type);
    }

    if (filters.overdue) {
      sql += ' AND mr.scheduled_date < NOW() AND mr.status NOT IN ("repaired", "scrap")';
    }

    if (filters.search) {
      sql += ' AND (mr.subject LIKE ? OR mr.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY mr.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT mr.*,
             e.name as equipment_name, e.serial_number, e.category,
             d.name as department_name,
             mt.name as team_name,
             u.name as created_by_name, u.email as created_by_email,
             t.id as technician_id,
             tu.name as technician_name, tu.email as technician_email,
             CASE 
               WHEN mr.scheduled_date < NOW() AND mr.status NOT IN ('repaired', 'scrap')
               THEN 1 ELSE 0
             END as is_overdue
      FROM maintenance_requests mr
      INNER JOIN equipment e ON mr.equipment_id = e.id
      INNER JOIN departments d ON mr.department_id = d.id
      INNER JOIN maintenance_teams mt ON mr.team_id = mt.id
      INNER JOIN users u ON mr.created_by = u.id
      LEFT JOIN technicians t ON mr.technician_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      WHERE mr.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async update(id, requestData) {
    const fields = [];
    const params = [];

    Object.keys(requestData).forEach((key) => {
      fields.push(`${key} = ?`);
      params.push(requestData[key]);
    });

    params.push(id);

    const sql = `UPDATE maintenance_requests SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
  }

  static async updateStatus(id, status, userId) {
    const sql = 'UPDATE maintenance_requests SET status = ? WHERE id = ?';
    await query(sql, [status, id]);
  }

  static async assignTechnician(id, technicianId) {
    const sql = 'UPDATE maintenance_requests SET technician_id = ? WHERE id = ?';
    await query(sql, [technicianId, id]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM maintenance_requests WHERE id = ?';
    await query(sql, [id]);
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM maintenance_requests WHERE 1=1';
    const params = [];

    if (filters.team_id) {
      sql += ' AND team_id = ?';
      params.push(filters.team_id);
    }

    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    const results = await query(sql, params);
    return results[0].total;
  }

  static async getCalendarView(filters = {}) {
    let sql = `
      SELECT mr.*, e.name as equipment_name, mt.name as team_name,
             tu.name as technician_name
      FROM maintenance_requests mr
      INNER JOIN equipment e ON mr.equipment_id = e.id
      INNER JOIN maintenance_teams mt ON mr.team_id = mt.id
      LEFT JOIN technicians t ON mr.technician_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      WHERE mr.type = 'preventive' AND mr.scheduled_date IS NOT NULL
    `;
    const params = [];

    if (filters.start_date) {
      sql += ' AND mr.scheduled_date >= ?';
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += ' AND mr.scheduled_date <= ?';
      params.push(filters.end_date);
    }

    sql += ' ORDER BY mr.scheduled_date ASC';

    return await query(sql, params);
  }

  static async getStatsByTeam() {
    const sql = `
      SELECT mt.id, mt.name as team_name,
             COUNT(mr.id) as total_requests,
             SUM(CASE WHEN mr.status = 'new' THEN 1 ELSE 0 END) as new_requests,
             SUM(CASE WHEN mr.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_requests,
             SUM(CASE WHEN mr.status = 'repaired' THEN 1 ELSE 0 END) as repaired_requests,
             SUM(CASE WHEN mr.status = 'scrap' THEN 1 ELSE 0 END) as scrap_requests
      FROM maintenance_teams mt
      LEFT JOIN maintenance_requests mr ON mt.id = mr.team_id
      GROUP BY mt.id, mt.name
    `;
    return await query(sql, []);
  }

  static async getStatsByEquipment() {
    const sql = `
      SELECT e.id, e.name as equipment_name, e.serial_number,
             COUNT(mr.id) as total_requests,
             SUM(CASE WHEN mr.status = 'repaired' THEN 1 ELSE 0 END) as repaired_count,
             SUM(CASE WHEN mr.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count
      FROM equipment e
      LEFT JOIN maintenance_requests mr ON e.id = mr.equipment_id
      GROUP BY e.id, e.name, e.serial_number
      ORDER BY total_requests DESC
    `;
    return await query(sql, []);
  }
}
