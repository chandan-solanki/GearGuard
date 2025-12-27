import { query } from '../config/database.js';

export class RefreshTokenModel {
  static async create(userId, token, expiresAt) {
    const sql = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `;
    const result = await query(sql, [userId, token, expiresAt]);
    return result.insertId;
  }

  static async findByToken(token) {
    const sql = `
      SELECT rt.*, u.id as user_id, u.email, u.name, u.role
      FROM refresh_tokens rt
      INNER JOIN users u ON rt.user_id = u.id
      WHERE rt.token = ? AND rt.expires_at > NOW()
    `;
    const results = await query(sql, [token]);
    return results[0] || null;
  }

  static async deleteByToken(token) {
    const sql = 'DELETE FROM refresh_tokens WHERE token = ?';
    await query(sql, [token]);
  }

  static async deleteByUserId(userId) {
    const sql = 'DELETE FROM refresh_tokens WHERE user_id = ?';
    await query(sql, [userId]);
  }

  static async deleteExpired() {
    const sql = 'DELETE FROM refresh_tokens WHERE expires_at <= NOW()';
    await query(sql, []);
  }
}
