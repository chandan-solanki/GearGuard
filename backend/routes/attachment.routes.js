import express from 'express';
import { AttachmentController, upload } from '../controllers/attachment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   POST /api/attachments/:requestId
 * @desc    Upload attachment to request
 * @access  Private
 */
router.post(
  '/:requestId',
  authenticate,
  upload.single('file'),
  AttachmentController.uploadAttachment
);

/**
 * @route   GET /api/attachments/:requestId
 * @desc    Get all attachments for request
 * @access  Private
 */
router.get('/:requestId', authenticate, AttachmentController.getAttachmentsByRequestId);

/**
 * @route   DELETE /api/attachments/file/:id
 * @desc    Delete attachment
 * @access  Private
 */
router.delete('/file/:id', authenticate, AttachmentController.deleteAttachment);

export default router;
