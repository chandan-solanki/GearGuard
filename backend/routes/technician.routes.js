import express from 'express';
import { TechnicianController } from '../controllers/technician.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/technicians
 * @desc    Get all technicians
 * @access  Private
 */
router.get('/', authenticate, TechnicianController.getAllTechnicians);

/**
 * @route   GET /api/technicians/me
 * @desc    Get current technician profile (for logged-in technician)
 * @access  Private (Technician)
 */
router.get('/me', authenticate, roleCheck('technician'), TechnicianController.getMyProfile);

/**
 * @route   GET /api/technicians/me/requests
 * @desc    Get requests assigned to current technician
 * @access  Private (Technician)
 */
router.get('/me/requests', authenticate, roleCheck('technician'), TechnicianController.getMyRequests);

/**
 * @route   GET /api/technicians/me/team-requests
 * @desc    Get all requests for technician's team (unassigned or team requests)
 * @access  Private (Technician)
 */
router.get('/me/team-requests', authenticate, roleCheck('technician'), TechnicianController.getTeamRequests);

/**
 * @route   GET /api/technicians/me/stats
 * @desc    Get statistics for current technician
 * @access  Private (Technician)
 */
router.get('/me/stats', authenticate, roleCheck('technician'), TechnicianController.getMyStats);

/**
 * @route   PUT /api/technicians/me/accept-request/:requestId
 * @desc    Technician accepts/self-assigns a request
 * @access  Private (Technician)
 */
router.put('/me/accept-request/:requestId', authenticate, roleCheck('technician'), TechnicianController.acceptRequest);

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
