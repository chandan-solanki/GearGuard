import { query } from '../config/database.js';

export class TaskModel {
  static async create(taskData) {
    const { title, description, status = 'pending', user_id } = taskData;
    const sql = 'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)';
    const result = await query(sql, [title, description, status, user_id]);
    return result.insertId;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT t.*, u.name as user_name, u.email as user_email 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC
    `;
    return await query(sql, [userId]);
  }

  static async findAll() {
    const sql = `
      SELECT t.*, u.name as user_name, u.email as user_email 
      FROM tasks t 
      LEFT JOIN users u ON t.user_id = u.id 
      ORDER BY t.created_at DESC
    `;
    return await query(sql);
  }

  static async update(id, taskData) {
    const { title, description, status } = taskData;
    const sql = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
    const result = await query(sql, [title, description, status, id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async countByUserId(userId) {
    const sql = 'SELECT COUNT(*) as count FROM tasks WHERE user_id = ?';
    const results = await query(sql, [userId]);
    return results[0].count;
  }
}
