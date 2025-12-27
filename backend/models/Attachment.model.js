import { query } from '../config/database.js';

export class AttachmentModel {
  static async create(attachmentData) {
    const { request_id, file_name, file_path, file_size, mime_type, uploaded_by } = attachmentData;

    const sql = `
      INSERT INTO attachments (request_id, file_name, file_path, file_size, mime_type, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const result = await query(sql, [
      request_id,
      file_name,
      file_path,
      file_size || null,
      mime_type || null,
      uploaded_by || null,
    ]);

    return result.insertId;
  }

  static async findByRequestId(requestId) {
    const sql = `
      SELECT a.*, u.name as uploaded_by_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by = u.id
      WHERE a.request_id = ?
      ORDER BY a.uploaded_at DESC
    `;
    return await query(sql, [requestId]);
  }

  static async findById(id) {
    const sql = 'SELECT * FROM attachments WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  static async delete(id) {
    const sql = 'DELETE FROM attachments WHERE id = ?';
    await query(sql, [id]);
  }

  static async deleteByRequestId(requestId) {
    const sql = 'DELETE FROM attachments WHERE request_id = ?';
    await query(sql, [requestId]);
  }
}
