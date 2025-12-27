import { query } from '../config/database.js';

/**
 * Department Model
 * 
 * Handles all database operations related to departments
 * Provides CRUD operations and utility methods for department management
 */
export class DepartmentModel {
  /**
   * Creates a new department in the database
   * 
   * @param {Object} departmentData - Department information
   * @param {string} departmentData.name - The name of the department (required)
   * @param {string} departmentData.description - Optional description of the department
   * @returns {Promise<number>} The ID of the newly created department
   * 
   * @example
   * const departmentId = await DepartmentModel.create({
   *   name: 'IT Department',
   *   description: 'Information Technology Department'
   * });
   */
  static async create(departmentData) {
    const { name, description } = departmentData;
    const sql = `
      INSERT INTO departments (name, description)
      VALUES (?, ?)
    `;
    const result = await query(sql, [name, description || null]);
    return result.insertId;
  }

  /**
   * Retrieves all departments from the database with optional filtering and pagination
   * 
   * @param {Object} filters - Optional filtering and pagination options
   * @param {string} filters.search - Search term to filter departments by name or description
   * @param {number} filters.limit - Number of records to return (default: 10)
   * @param {number} filters.offset - Number of records to skip (default: 0)
   * @returns {Promise<Array>} Array of department objects ordered by name
   * 
   * @example
   * const departments = await DepartmentModel.findAll({
   *   search: 'IT',
   *   limit: 20,
   *   offset: 0
   * });
   */
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM departments WHERE 1=1';
    const params = [];

    // Apply search filter if provided
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Always order results by department name alphabetically
    sql += ' ORDER BY name ASC';

    // Apply pagination if limit is provided
    if (filters.limit) {
      const limit = parseInt(filters.limit, 10) || 10;
      const offset = parseInt(filters.offset, 10) || 0;
      sql += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    return await query(sql, params);
  }

  /**
   * Retrieves a single department by its ID
   * 
   * @param {number} id - The department ID
   * @returns {Promise<Object|null>} Department object if found, null otherwise
   * 
   * @example
   * const department = await DepartmentModel.findById(1);
   */
  static async findById(id) {
    const sql = 'SELECT * FROM departments WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  /**
   * Updates an existing department's information
   * 
   * @param {number} id - The department ID to update
   * @param {Object} departmentData - Updated department information
   * @param {string} departmentData.name - The updated name of the department
   * @param {string} departmentData.description - The updated description
   * @returns {Promise<void>}
   * 
   * @example
   * await DepartmentModel.update(1, {
   *   name: 'Updated IT Department',
   *   description: 'New description'
   * });
   */
  static async update(id, departmentData) {
    const { name, description } = departmentData;
    const sql = `
      UPDATE departments
      SET name = ?, description = ?
      WHERE id = ?
    `;
    await query(sql, [name, description, id]);
  }

  /**
   * Deletes a department from the database
   * 
   * @param {number} id - The department ID to delete
   * @returns {Promise<void>}
   * 
   * @example
   * await DepartmentModel.delete(1);
   */
  static async delete(id) {
    const sql = 'DELETE FROM departments WHERE id = ?';
    await query(sql, [id]);
  }

  /**
   * Counts the total number of departments, optionally filtered by search criteria
   * 
   * @param {Object} filters - Optional filtering options
   * @param {string} filters.search - Search term to filter departments by name or description
   * @returns {Promise<number>} Total count of departments matching the criteria
   * 
   * @example
   * const totalDepartments = await DepartmentModel.count();
   * const searchResults = await DepartmentModel.count({ search: 'IT' });
   */
  static async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM departments WHERE 1=1';
    const params = [];

    // Apply search filter if provided
    if (filters.search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const results = await query(sql, params);
    return results[0].total;
  }
}
