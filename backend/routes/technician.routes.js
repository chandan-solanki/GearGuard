import express from 'express';
import { TechnicianController } from '../controllers/technician.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/technicians
 * @desc    Get all technicians
 * @access  Private
 */
router.get('/', authenticate, TechnicianController.getAllTechnicians);

/**
 * @route   GET /api/technicians/:id
 * @desc    Get technician by ID
 * @access  Private
 */
router.get('/:id', authenticate, TechnicianController.getTechnicianById);

/**
 * @route   PUT /api/technicians/:id
 * @desc    Update technician
 * @access  Private
 */
router.put('/:id', authenticate, TechnicianController.updateTechnician);

export default router;
