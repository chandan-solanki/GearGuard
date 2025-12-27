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
}
