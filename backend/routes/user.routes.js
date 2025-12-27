import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (Admin, Manager)
 */
router.get('/', authenticate, roleCheck('admin', 'manager'), UserController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin, Manager)
 */
router.get('/:id', authenticate, roleCheck('admin', 'manager'), UserController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, roleCheck('admin'), UserController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, roleCheck('admin'), UserController.deleteUser);

/**
 * @route   POST /api/users/:id/assign-technician
 * @desc    Assign user to technician role
 * @access  Private (Admin, Manager)
 */
router.post(
  '/:id/assign-technician',
  authenticate,
  roleCheck('admin', 'manager'),
  UserController.assignToTechnician
);

/**
 * @route   DELETE /api/users/:id/remove-technician
 * @desc    Remove user from technician role
 * @access  Private (Admin, Manager)
 */
router.delete(
  '/:id/remove-technician',
  authenticate,
  roleCheck('admin', 'manager'),
  UserController.removeFromTechnician
);

export default router;
