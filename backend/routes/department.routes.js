import express from 'express';
import { DepartmentController } from '../controllers/department.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/departments
 * @desc    Get all departments
 * @access  Private
 */
router.get('/', authenticate, DepartmentController.getAllDepartments);

/**
 * @route   GET /api/departments/:id
 * @desc    Get department by ID
 * @access  Private
 */
router.get('/:id', authenticate, DepartmentController.getDepartmentById);

/**
 * @route   POST /api/departments
 * @desc    Create new department
 * @access  Private (Admin)
 */
router.post('/', authenticate, roleCheck('admin'), DepartmentController.createDepartment);

/**
 * @route   PUT /api/departments/:id
 * @desc    Update department
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, roleCheck('admin'), DepartmentController.updateDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    Delete department
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, roleCheck('admin'), DepartmentController.deleteDepartment);

export default router;
