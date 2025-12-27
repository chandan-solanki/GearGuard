import express from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (admin sees all, users see their own)
 * @access  Private (user, admin)
 */
router.get('/', TaskController.getTasks);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private (user, admin)
 */
router.post('/', TaskController.createTask);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private (user, admin)
 */
router.get('/stats', TaskController.getTaskStats);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private (user can see own, admin sees all)
 */
router.get('/:id', TaskController.getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private (user can update own, admin can update all)
 */
router.put('/:id', TaskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private (admin only)
 */
router.delete('/:id', roleCheck('admin'), TaskController.deleteTask);

export default router;
