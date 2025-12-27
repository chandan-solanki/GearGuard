import { MaintenanceRequestModel } from '../models/MaintenanceRequest.model.js';
import { MaintenanceLogModel } from '../models/MaintenanceLog.model.js';
import { EquipmentModel } from '../models/Equipment.model.js';
import { TechnicianModel } from '../models/Technician.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class MaintenanceRequestService {
  static async createRequest(requestData, userId) {
    // Verify equipment exists and get its team/department
    const equipment = await EquipmentModel.findById(requestData.equipment_id);
    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    // Auto-fill team and department from equipment
    const data = {
      ...requestData,
      department_id: equipment.department_id,
      team_id: equipment.team_id,
      created_by: userId,
    };

    const id = await MaintenanceRequestModel.create(data);

    // Create initial log entry
    await MaintenanceLogModel.create({
      request_id: id,
      old_status: null,
      new_status: 'new',
      changed_by: userId,
      notes: 'Request created',
    });

    return await MaintenanceRequestModel.findById(id);
  }

  static async getAllRequests(filters) {
    const requests = await MaintenanceRequestModel.findAll(filters);
    const total = await MaintenanceRequestModel.count(filters);

    return {
      requests,
      pagination: {
        total,
        limit: filters.limit ? parseInt(filters.limit) : total,
        offset: filters.offset ? parseInt(filters.offset) : 0,
      },
    };
  }

  static async getRequestById(id) {
    const request = await MaintenanceRequestModel.findById(id);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }
    return request;
  }

  static async updateRequest(id, requestData) {
    const request = await MaintenanceRequestModel.findById(id);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    await MaintenanceRequestModel.update(id, requestData);
    return await MaintenanceRequestModel.findById(id);
  }

  static async assignTechnician(id, technicianId, userId) {
    const request = await MaintenanceRequestModel.findById(id);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    // Verify technician exists
    const technician = await TechnicianModel.findById(technicianId);
    if (!technician) {
      throw new AppError('Technician not found', 404);
    }

    await MaintenanceRequestModel.assignTechnician(id, technicianId);

    // Log the assignment
    await MaintenanceLogModel.create({
      request_id: id,
      old_status: request.status,
      new_status: request.status,
      changed_by: userId,
      notes: `Assigned to technician: ${technician.name}`,
    });

    return await MaintenanceRequestModel.findById(id);
  }

  static async updateStatus(id, newStatus, userId, durationHours = null) {
    const request = await MaintenanceRequestModel.findById(id);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    const oldStatus = request.status;

    // Update request status
    const updateData = { status: newStatus };
    if (durationHours !== null && newStatus === 'repaired') {
      updateData.duration_hours = durationHours;
    }

    await MaintenanceRequestModel.update(id, updateData);

    // If status is 'scrap', update equipment status to 'scrapped'
    if (newStatus === 'scrap') {
      await EquipmentModel.updateStatus(request.equipment_id, 'scrapped');
    }

    // Create log entry
    await MaintenanceLogModel.create({
      request_id: id,
      old_status: oldStatus,
      new_status: newStatus,
      changed_by: userId,
      notes: durationHours ? `Completed in ${durationHours} hours` : null,
    });

    return await MaintenanceRequestModel.findById(id);
  }

  static async deleteRequest(id) {
    const request = await MaintenanceRequestModel.findById(id);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    await MaintenanceRequestModel.delete(id);
    return { message: 'Maintenance request deleted successfully' };
  }

  static async getCalendarView(filters) {
    return await MaintenanceRequestModel.getCalendarView(filters);
  }

  static async getRequestLogs(requestId) {
    const request = await MaintenanceRequestModel.findById(requestId);
    if (!request) {
      throw new AppError('Maintenance request not found', 404);
    }

    return await MaintenanceLogModel.findByRequestId(requestId);
  }

  static async getStatsByTeam() {
    return await MaintenanceRequestModel.getStatsByTeam();
  }

  static async getStatsByEquipment() {
    return await MaintenanceRequestModel.getStatsByEquipment();
  }
}
