import express from 'express';
import { MaintenanceTeamController } from '../controllers/maintenanceTeam.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/teams
 * @desc    Get all maintenance teams
 * @access  Private
 */
router.get('/', authenticate, MaintenanceTeamController.getAllTeams);

/**
 * @route   GET /api/teams/:id
 * @desc    Get team by ID
 * @access  Private
 */
router.get('/:id', authenticate, MaintenanceTeamController.getTeamById);

/**
 * @route   POST /api/teams
 * @desc    Create new team
 * @access  Private (Admin, Manager)
 */
router.post('/', authenticate, roleCheck('admin', 'manager'), MaintenanceTeamController.createTeam);

/**
 * @route   PUT /api/teams/:id
 * @desc    Update team
 * @access  Private (Admin, Manager)
 */
router.put('/:id', authenticate, roleCheck('admin', 'manager'), MaintenanceTeamController.updateTeam);

/**
 * @route   DELETE /api/teams/:id
 * @desc    Delete team
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, roleCheck('admin'), MaintenanceTeamController.deleteTeam);

/**
 * @route   GET /api/teams/:id/technicians
 * @desc    Get all technicians in team
 * @access  Private
 */
router.get('/:id/technicians', authenticate, MaintenanceTeamController.getTeamTechnicians);

export default router;
