import { AttachmentService } from '../services/attachment.service.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/env.config.js';

// Create uploads directory if it doesn't exist
const uploadDir = config.upload.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDFs are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

export class AttachmentController {
  static async uploadAttachment(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
        });
      }

      const fileData = {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      };

      const attachment = await AttachmentService.createAttachment(
        req.params.requestId,
        fileData,
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: attachment,
      });
    } catch (error) {
      // Delete uploaded file if error occurs
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      next(error);
    }
  }

  static async getAttachmentsByRequestId(req, res, next) {
    try {
      const attachments = await AttachmentService.getAttachmentsByRequestId(req.params.requestId);

      res.status(200).json({
        success: true,
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAttachment(req, res, next) {
    try {
      const result = await AttachmentService.deleteAttachment(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
