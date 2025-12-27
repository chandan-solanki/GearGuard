import { AttachmentModel } from '../models/Attachment.model.js';
import { MaintenanceRequestModel } from '../models/MaintenanceRequest.model.js';
import { AppError } from '../middleware/errorHandler.js';
import fs from 'fs/promises';
import path from 'path';

export class AttachmentService {
  static async createAttachment(requestId, fileData, userId) {
    // Verify request exists
    const request = await MaintenanceRequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    const attachmentData = {
      request_id: requestId,
      file_name: fileData.filename,
      file_path: fileData.path,
      file_size: fileData.size,
      mime_type: fileData.mimetype,
      uploaded_by: userId,
    };

    const id = await AttachmentModel.create(attachmentData);
    return await AttachmentModel.findById(id);
  }

  static async getAttachmentsByRequestId(requestId) {
    const request = await MaintenanceRequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    return await AttachmentModel.findByRequestId(requestId);
  }

  static async deleteAttachment(id) {
    const attachment = await AttachmentModel.findById(id);
    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    // Delete file from filesystem
    try {
      await fs.unlink(attachment.file_path);
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue even if file deletion fails
    }

    await AttachmentModel.delete(id);
    return { message: 'Attachment deleted successfully' };
  }
}
