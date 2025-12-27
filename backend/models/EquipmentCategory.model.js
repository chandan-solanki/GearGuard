import { query } from '../config/database.js';

export class EquipmentCategoryModel {
  static async create(categoryData) {
    const { name, responsible, company_name, description } = categoryData;

    const sql = `
      INSERT INTO equipment_category (name, responsible, company_name, description)
      VALUES (?, ?, ?, ?)
    `;

    const result = await query(sql, [
      name,
      responsible || null,
      company_name || null,
      description || null,
    ]);

    return result.insertId;
  }

  static async findAll(filters = {}) {
    let sql = `
      SELECT * FROM equipment_category
      WHERE 1=1
    `;
    const params = [];

    if (filters.name) {
      sql += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.company_name) {
      sql += ' AND company_name LIKE ?';
      params.push(`%${filters.company_name}%`);
    }

    if (filters.responsible) {
      sql += ' AND responsible LIKE ?';
      params.push(`%${filters.responsible}%`);
    }

    sql += ' ORDER BY name';

    // Pagination
    const limit = parseInt(filters.limit) || 50;
    const offset = parseInt(filters.offset) || 0;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const results = await query(sql, params);
    return results;
  }

  static async findById(id) {
    const sql = `
      SELECT * FROM equipment_category
      WHERE id = ?
    `;
    const results = await query(sql, [id]);
    return results[0];
  }

  static async findByName(name) {
    const sql = `
      SELECT * FROM equipment_category
      WHERE name = ?
    `;
    const results = await query(sql, [name]);
    return results[0];
  }

  static async update(id, categoryData) {
    const { name, responsible, company_name, description } = categoryData;

    const sql = `
      UPDATE equipment_category
      SET name = ?, responsible = ?, company_name = ?, description = ?
      WHERE id = ?
    `;

    const result = await query(sql, [
      name,
      responsible || null,
      company_name || null,
      description || null,
      id,
    ]);

    return result.affectedRows;
  }

  static async delete(id) {
    // Check if category is being used by any equipment
    const checkSql = `
      SELECT COUNT(*) as count FROM equipment
      WHERE category_id = ?
    `;
    const checkResult = await query(checkSql, [id]);

    if (checkResult[0].count > 0) {
      throw new Error(
        `Cannot delete category. It is currently being used by ${checkResult[0].count} equipment(s).`
      );
    }

    const sql = `DELETE FROM equipment_category WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows;
  }

  static async getEquipmentCount(categoryId) {
    const sql = `
      SELECT COUNT(*) as count FROM equipment
      WHERE category_id = ?
    `;
    const results = await query(sql, [categoryId]);
    return results[0].count;
  }

  static async getCategoryStats() {
    const sql = `
      SELECT 
        ec.id,
        ec.name,
        ec.responsible,
        ec.company_name,
        COUNT(e.id) as equipment_count,
        SUM(CASE WHEN e.status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN e.status = 'scrapped' THEN 1 ELSE 0 END) as scrapped_count
      FROM equipment_category ec
      LEFT JOIN equipment e ON ec.id = e.category_id
      GROUP BY ec.id, ec.name, ec.responsible, ec.company_name
      ORDER BY equipment_count DESC
    `;
    const results = await query(sql);
    return results;
  }
}
