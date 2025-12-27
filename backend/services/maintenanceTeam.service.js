import { MaintenanceTeamModel } from '../models/MaintenanceTeam.model.js';
import { DepartmentModel } from '../models/Department.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class MaintenanceTeamService {
  static async createTeam(teamData) {
    // Verify department exists
    const department = await DepartmentModel.findById(teamData.department_id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const id = await MaintenanceTeamModel.create(teamData);
    return await MaintenanceTeamModel.findById(id);
  }

  static async getAllTeams(filters) {
    const teams = await MaintenanceTeamModel.findAll(filters);
    const total = await MaintenanceTeamModel.count(filters);

    return {
      teams,
      pagination: {
        total,
        limit: filters.limit ? parseInt(filters.limit) : total,
        offset: filters.offset ? parseInt(filters.offset) : 0,
      },
    };
  }

  static async getTeamById(id) {
    const team = await MaintenanceTeamModel.findById(id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }
    return team;
  }

  static async updateTeam(id, teamData) {
    const team = await MaintenanceTeamModel.findById(id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    // Verify department exists if being updated
    if (teamData.department_id) {
      const department = await DepartmentModel.findById(teamData.department_id);
      if (!department) {
        throw new AppError('Department not found', 404);
      }
    }

    await MaintenanceTeamModel.update(id, teamData);
    return await MaintenanceTeamModel.findById(id);
  }

  static async deleteTeam(id) {
    const team = await MaintenanceTeamModel.findById(id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    await MaintenanceTeamModel.delete(id);
    return { message: 'Team deleted successfully' };
  }

  static async getTeamTechnicians(id) {
    const team = await MaintenanceTeamModel.findById(id);
    if (!team) {
      throw new AppError('Team not found', 404);
    }

    return await MaintenanceTeamModel.getTechnicians(id);
  }
}
