import { TechnicianModel } from '../models/Technician.model.js';
import { MaintenanceRequestModel } from '../models/MaintenanceRequest.model.js';
import { MaintenanceLogModel } from '../models/MaintenanceLog.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class TechnicianService {
  static async getAllTechnicians(filters) {
    return await TechnicianModel.findAll(filters);
  }

  static async getTechnicianById(id) {
    const technician = await TechnicianModel.findById(id);
    if (!technician) {
      throw new AppError('Technician not found', 404);
    }
    return technician;
  }

  static async getTechnicianByUserId(userId) {
    const technician = await TechnicianModel.findByUserId(userId);
    if (!technician) {
      throw new AppError('Technician profile not found', 404);
    }
    return technician;
  }

  static async updateTechnician(id, technicianData) {
    const technician = await TechnicianModel.findById(id);
    if (!technician) {
      throw new AppError('Technician not found', 404);
    }

    await TechnicianModel.update(id, technicianData);
    return await TechnicianModel.findById(id);
  }

  /**
   * Get requests assigned to the current technician
   */
  static async getMyRequests(userId, filters) {
    const technician = await TechnicianModel.findByUserId(userId);
    if (!technician) {
      throw new AppError('Technician profile not found', 404);
    }

    const requestFilters = {
      ...filters,
      technician_id: technician.id,
    };

    const requests = await MaintenanceRequestModel.findAll(requestFilters);
    const total = await MaintenanceRequestModel.countByTechnician(technician.id, filters);

    return {
      requests,
      pagination: {
        total,
        limit: parseInt(filters.limit) || 50,
        offset: parseInt(filters.offset) || 0,
      },
    };
  }

  /**
   * Get all requests for technician's team (for self-assignment)
   * Shows requests assigned to the team, filtered by category
   */
  static async getTeamRequests(userId, filters) {
    const technician = await TechnicianModel.findByUserId(userId);
    if (!technician) {
      throw new AppError('Technician profile not found', 404);
    }

    const result = await TechnicianModel.getTeamRequests(technician.team_id, technician.id, filters);

    return {
      requests: result.requests,
      pagination: {
        total: result.total,
        limit: parseInt(filters.limit) || 50,
        offset: parseInt(filters.offset) || 0,
      },
    };
  }

  /**
   * Get statistics for current technician
   */
  static async getMyStats(userId) {
    const technician = await TechnicianModel.findByUserId(userId);
    if (!technician) {
      throw new AppError('Technician profile not found', 404);
    }

    return await TechnicianModel.getStats(technician.id);
  }

  /**
   * Technician accepts/self-assigns a request from their team
   */
  static async acceptRequest(userId, requestId) {
    const technician = await TechnicianModel.findByUserId(userId);
    if (!technician) {
      throw new AppError('Technician profile not found', 404);
    }

    const request = await MaintenanceRequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    // Verify request belongs to technician's team
    if (request.team_id !== technician.team_id) {
      throw new AppError('This request belongs to a different team', 403);
    }

    // Verify request is not already assigned to another technician
    if (request.technician_id && request.technician_id !== technician.id) {
      throw new AppError('This request is already assigned to another technician', 400);
    }

    // Assign the technician
    await MaintenanceRequestModel.assignTechnician(requestId, technician.id);

    // Log the self-assignment
    await MaintenanceLogModel.create({
      request_id: requestId,
      old_status: request.status,
      new_status: request.status,
      changed_by: userId,
      notes: `Technician ${technician.name} accepted the request`,
    });

    return await MaintenanceRequestModel.findById(requestId);
  }
}
