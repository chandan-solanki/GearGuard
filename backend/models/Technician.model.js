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
      SELECT t.*, u.name, u.email, u.role, mt.name as team_name,
             d.name as department_name, d.id as department_id
      FROM technicians t
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN maintenance_teams mt ON t.team_id = mt.id
      INNER JOIN departments d ON mt.department_id = d.id
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

  /**
   * Get requests for technician's team (for self-assignment)
   */
  static async getTeamRequests(teamId, technicianId, filters = {}) {
    let sql = `
      SELECT mr.*,
             e.name as equipment_name, e.serial_number, e.location as equipment_location,
             ec.name as category_name, ec.responsible as category_responsible, ec.company_name as category_company,
             d.name as department_name,
             mt.name as team_name,
             u.name as created_by_name,
             tu.name as technician_name,
             CASE 
               WHEN mr.scheduled_date < NOW() AND mr.status NOT IN ('repaired', 'scrap')
               THEN 1 ELSE 0
             END as is_overdue
      FROM maintenance_requests mr
      INNER JOIN equipment e ON mr.equipment_id = e.id
      INNER JOIN equipment_category ec ON e.category_id = ec.id
      INNER JOIN departments d ON mr.department_id = d.id
      INNER JOIN maintenance_teams mt ON mr.team_id = mt.id
      INNER JOIN users u ON mr.created_by = u.id
      LEFT JOIN technicians t ON mr.technician_id = t.id
      LEFT JOIN users tu ON t.user_id = tu.id
      WHERE mr.team_id = ?
    `;
    const params = [teamId];

    // Filter unassigned only
    if (filters.unassigned_only) {
      sql += ' AND mr.technician_id IS NULL';
    }

    if (filters.status) {
      sql += ' AND mr.status = ?';
      params.push(filters.status);
    }

    if (filters.type) {
      sql += ' AND mr.type = ?';
      params.push(filters.type);
    }

    if (filters.priority) {
      sql += ' AND mr.priority = ?';
      params.push(filters.priority);
    }

    sql += ' ORDER BY FIELD(mr.priority, "critical", "high", "medium", "low"), mr.created_at DESC';

    // Get total count
    const countSql = sql.replace(/SELECT mr\.\*,[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await query(countSql.split('ORDER BY')[0], params);
    const total = countResult[0]?.total || 0;

    // Add pagination
    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 50;
      const offset = parseInt(filters.offset, 10) || 0;
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const requests = await query(sql, params);

    return { requests, total };
  }

  /**
   * Get statistics for a technician
   */
  static async getStats(technicianId) {
    const sql = `
      SELECT 
        COUNT(*) as total_assigned,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_requests,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'repaired' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'scrap' THEN 1 ELSE 0 END) as scrapped,
        SUM(CASE WHEN scheduled_date < NOW() AND status NOT IN ('repaired', 'scrap') THEN 1 ELSE 0 END) as overdue,
        SUM(CASE WHEN priority = 'critical' AND status NOT IN ('repaired', 'scrap') THEN 1 ELSE 0 END) as critical_pending,
        SUM(CASE WHEN priority = 'high' AND status NOT IN ('repaired', 'scrap') THEN 1 ELSE 0 END) as high_pending,
        AVG(CASE WHEN status = 'repaired' AND duration_hours IS NOT NULL THEN duration_hours ELSE NULL END) as avg_resolution_hours
      FROM maintenance_requests
      WHERE technician_id = ?
    `;

    const results = await query(sql, [technicianId]);
    const stats = results[0] || {};

    // Get requests by category
    const categorySql = `
      SELECT ec.name as category_name, COUNT(*) as request_count
      FROM maintenance_requests mr
      INNER JOIN equipment e ON mr.equipment_id = e.id
      INNER JOIN equipment_category ec ON e.category_id = ec.id
      WHERE mr.technician_id = ?
      GROUP BY ec.id, ec.name
      ORDER BY request_count DESC
    `;
    const categoryStats = await query(categorySql, [technicianId]);

    // Get requests by type
    const typeSql = `
      SELECT type, COUNT(*) as count
      FROM maintenance_requests
      WHERE technician_id = ?
      GROUP BY type
    `;
    const typeStats = await query(typeSql, [technicianId]);

    return {
      ...stats,
      avg_resolution_hours: stats.avg_resolution_hours ? parseFloat(stats.avg_resolution_hours).toFixed(1) : null,
      by_category: categoryStats,
      by_type: typeStats,
    };
  }
}
