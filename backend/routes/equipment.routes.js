import express from 'express';
import { EquipmentController } from '../controllers/equipment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment
 * @access  Private
 */
router.get('/', authenticate, EquipmentController.getAllEquipment);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Private
 */
router.get('/:id', authenticate, EquipmentController.getEquipmentById);

/**
 * @route   POST /api/equipment
 * @desc    Create new equipment
 * @access  Private (Admin, Manager)
 */
router.post('/', authenticate, roleCheck('admin', 'manager'), EquipmentController.createEquipment);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment
 * @access  Private (Admin, Manager)
 */
router.put('/:id', authenticate, roleCheck('admin', 'manager'), EquipmentController.updateEquipment);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, roleCheck('admin'), EquipmentController.deleteEquipment);

/**
 * @route   GET /api/equipment/:id/requests
 * @desc    Get all maintenance requests for equipment
 * @access  Private
 */
router.get('/:id/requests', authenticate, EquipmentController.getEquipmentRequests);

export default router;
