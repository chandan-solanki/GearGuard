import { query } from '../config/database.js';

export class EquipmentModel {
  static async create(equipmentData) {
    const {
      name,
      serial_number,
      category_id,
      purchase_date,
      warranty_end,
      location,
      department_id,
      team_id,
      status,
    } = equipmentData;

    const sql = `
      INSERT INTO equipment (
        name, serial_number, category_id, purchase_date, warranty_end,
        location, department_id, team_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name,
      serial_number || null,
      category_id,
      purchase_date || null,
      warranty_end || null,
      location || null,
      department_id,
      team_id,
      status || 'active',
    ]);

    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT e.*, 
             d.name as department_name, 
             mt.name as team_name,
             ec.name as category_name,
             ec.responsible as category_responsible,
             ec.company_name as category_company
      FROM equipment e
      INNER JOIN departments d ON e.department_id = d.id
      INNER JOIN maintenance_teams mt ON e.team_id = mt.id
      INNER JOIN equipment_category ec ON e.category_id = ec.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.department_id) {
      sql += ' AND e.department_id = ?';
      params.push(filters.department_id);
    }

    if (filters.team_id) {
      sql += ' AND e.team_id = ?';
      params.push(filters.team_id);
    }

    if (filters.status) {
      sql += ' AND e.status = ?';
      params.push(filters.status);
    }

    if (filters.category_id) {
      sql += ' AND e.category_id = ?';
      params.push(filters.category_id);
    }

    if (filters.search) {
      sql += ' AND (e.name LIKE ? OR e.serial_number LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    sql += ' ORDER BY e.name ASC';

    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 10;
      const offset = parseInt(filters.offset, 10) || 0;
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    return await query(sql, params);
  }

  static async findById(id) {
    const sql = `
      SELECT e.*, 
             d.name as department_name, 
             mt.name as team_name,
             ec.name as category_name,
             ec.responsible as category_responsible,
             ec.company_name as category_company,
             ec.description as category_description
      FROM equipment e
      INNER JOIN departments d ON e.department_id = d.id
      INNER JOIN maintenance_teams mt ON e.team_id = mt.id
      INNER JOIN equipment_category ec ON e.category_id = ec.id
      WHERE e.id = ?
    `;
    const results = await query(sql, [id]);
    return results[0] || null;
  }


  // update equipment details
  static async update(id, equipmentData) {
    const {
      name,
      serial_number,
      category_id,
      purchase_date,
      warranty_end,
      location,
      department_id,
      team_id,
      status,
    } = equipmentData;

    const sql = `
      UPDATE equipment
      SET name = ?, serial_number = ?, category_id = ?, purchase_date = ?,
          warranty_end = ?, location = ?, department_id = ?, team_id = ?, status = ?
      WHERE id = ?
    `;

    await query(sql, [
      name,
      serial_number,
      category_id,
      purchase_date,
      warranty_end,
      location,
      department_id,
      team_id,
      status,
      id,
    ]);
  }

  static async delete(id) {
    const sql = 'DELETE FROM equipment WHERE id = ?';
    await query(sql, [id]);
  }

  static async updateStatus(id, status) {
    const sql = 'UPDATE equipment SET status = ? WHERE id = ?';
    await query(sql, [status, id]);
  }

  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM equipment WHERE 1=1';
    const params = [];

    if (filters.department_id) {
      sql += ' AND department_id = ?';
      params.push(filters.department_id);
    }

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
}
