import { TechnicianService } from '../services/technician.service.js';

export class TechnicianController {
  static async getAllTechnicians(req, res, next) {
    try {
      const filters = {
        team_id: req.query.team_id,
        department_id: req.query.department_id,
        limit: req.query.limit,
        offset: req.query.offset || 0,
      };

      const technicians = await TechnicianService.getAllTechnicians(filters);

      res.status(200).json({
        success: true,
        data: technicians,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTechnicianById(req, res, next) {
    try {
      const technician = await TechnicianService.getTechnicianById(req.params.id);

      res.status(200).json({
        success: true,
        data: technician,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTechnician(req, res, next) {
    try {
      const { team_id } = req.body;

      if (!team_id) {
        return res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
      }

      const technician = await TechnicianService.updateTechnician(req.params.id, { team_id });

      res.status(200).json({
        success: true,
        message: 'Technician updated successfully',
        data: technician,
      });
    } catch (error) {
      next(error);
    }
  }

  // ========== TECHNICIAN SELF-SERVICE ENDPOINTS ==========

  /**
   * Get current technician's profile
   */
  static async getMyProfile(req, res, next) {
    try {
      const technician = await TechnicianService.getTechnicianByUserId(req.user.id);

      res.status(200).json({
        success: true,
        data: technician,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get requests assigned to current technician
   * Supports filtering by status, type, priority
   */
  static async getMyRequests(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        priority: req.query.priority,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0,
      };

      const result = await TechnicianService.getMyRequests(req.user.id, filters);

      res.status(200).json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all requests for technician's team (for self-assignment)
   * Shows unassigned requests or requests within the same team/category
   */
  static async getTeamRequests(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        priority: req.query.priority,
        unassigned_only: req.query.unassigned_only === 'true',
        limit: req.query.limit || 50,
        offset: req.query.offset || 0,
      };

      const result = await TechnicianService.getTeamRequests(req.user.id, filters);

      res.status(200).json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get statistics for current technician
   */
  static async getMyStats(req, res, next) {
    try {
      const stats = await TechnicianService.getMyStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Technician accepts/self-assigns a request
   */
  static async acceptRequest(req, res, next) {
    try {
      const request = await TechnicianService.acceptRequest(
        req.user.id,
        req.params.requestId
      );

      res.status(200).json({
        success: true,
        message: 'Request accepted successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }
}
