import { MaintenanceTeamService } from '../services/maintenanceTeam.service.js';

export class MaintenanceTeamController {
  static async createTeam(req, res, next) {
    try {
      const { name, department_id } = req.body;

      if (!name || !department_id) {
        return res.status(400).json({
          success: false,
          message: 'Team name and department ID are required',
        });
      }

      const team = await MaintenanceTeamService.createTeam({ name, department_id });

      res.status(201).json({
        success: true,
        message: 'Maintenance team created successfully',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllTeams(req, res, next) {
    try {
      const filters = {
        department_id: req.query.department_id,
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset || 0,
      };

      const result = await MaintenanceTeamService.getAllTeams(filters);

      res.status(200).json({
        success: true,
        data: result.teams,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamById(req, res, next) {
    try {
      const team = await MaintenanceTeamService.getTeamById(req.params.id);

      res.status(200).json({
        success: true,
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTeam(req, res, next) {
    try {
      const { name, department_id } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (department_id) updateData.department_id = department_id;

      const team = await MaintenanceTeamService.updateTeam(req.params.id, updateData);

      res.status(200).json({
        success: true,
        message: 'Team updated successfully',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTeam(req, res, next) {
    try {
      const result = await MaintenanceTeamService.deleteTeam(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamTechnicians(req, res, next) {
    try {
      const technicians = await MaintenanceTeamService.getTeamTechnicians(req.params.id);

      res.status(200).json({
        success: true,
        data: technicians,
      });
    } catch (error) {
      next(error);
    }
  }
}
