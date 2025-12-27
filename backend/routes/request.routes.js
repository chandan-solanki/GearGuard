import express from 'express';
import { MaintenanceRequestController } from '../controllers/maintenanceRequest.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/requests
 * @desc    Get all maintenance requests
 * @access  Private
 */
router.get('/', authenticate, MaintenanceRequestController.getAllRequests);

/**
 * @route   GET /api/requests/calendar
 * @desc    Get calendar view of preventive maintenance
 * @access  Private
 */
router.get('/calendar', authenticate, MaintenanceRequestController.getCalendarView);

/**
 * @route   GET /api/requests/stats/team
 * @desc    Get statistics by team
 * @access  Private (Admin, Manager)
 */
router.get(
  '/stats/team',
  authenticate,
  roleCheck('admin', 'manager'),
  MaintenanceRequestController.getStatsByTeam
);

/**
 * @route   GET /api/requests/stats/equipment
 * @desc    Get statistics by equipment
 * @access  Private (Admin, Manager)
 */
router.get(
  '/stats/equipment',
  authenticate,
  roleCheck('admin', 'manager'),
  MaintenanceRequestController.getStatsByEquipment
);

/**
 * @route   GET /api/requests/:id
 * @desc    Get request by ID
 * @access  Private
 */
router.get('/:id', authenticate, MaintenanceRequestController.getRequestById);

/**
 * @route   POST /api/requests
 * @desc    Create new maintenance request
 * @access  Private
 */
router.post('/', authenticate, MaintenanceRequestController.createRequest);

/**
 * @route   PUT /api/requests/:id
 * @desc    Update maintenance request
 * @access  Private
 */
router.put('/:id', authenticate, MaintenanceRequestController.updateRequest);

/**
 * @route   PUT /api/requests/:id/assign-technician
 * @desc    Assign technician to request
 * @access  Private (Admin, Manager)
 */
router.put(
  '/:id/assign-technician',
  authenticate,
  roleCheck('admin', 'manager'),
  MaintenanceRequestController.assignTechnician
);

/**
 * @route   PUT /api/requests/:id/status
 * @desc    Update request status
 * @access  Private
 */
router.put('/:id/status', authenticate, MaintenanceRequestController.updateStatus);

/**
 * @route   GET /api/requests/:id/logs
 * @desc    Get request logs
 * @access  Private
 */
router.get('/:id/logs', authenticate, MaintenanceRequestController.getRequestLogs);

/**
 * @route   DELETE /api/requests/:id
 * @desc    Delete maintenance request
 * @access  Private (Admin, Manager)
 */
router.delete(
  '/:id',
  authenticate,
  roleCheck('admin', 'manager'),
  MaintenanceRequestController.deleteRequest
);

export default router;
