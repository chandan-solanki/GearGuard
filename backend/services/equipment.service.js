import { EquipmentModel } from '../models/Equipment.model.js';
import { DepartmentModel } from '../models/Department.model.js';
import { MaintenanceTeamModel } from '../models/MaintenanceTeam.model.js';
import { MaintenanceRequestModel } from '../models/MaintenanceRequest.model.js';
import { EquipmentCategoryModel } from '../models/EquipmentCategory.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class EquipmentService {
  static async createEquipment(equipmentData) {
    // Verify category exists
    const category = await EquipmentCategoryModel.findById(equipmentData.category_id);
    if (!category) {
      throw new AppError('Equipment category not found', 404);
    }

    // Verify department and team exist
    const department = await DepartmentModel.findById(equipmentData.department_id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    const team = await MaintenanceTeamModel.findById(equipmentData.team_id);
    if (!team) {
      throw new AppError('Maintenance team not found', 404);
    }

    const id = await EquipmentModel.create(equipmentData);
    return await EquipmentModel.findById(id);
  }

  static async getAllEquipment(filters) {
    const equipment = await EquipmentModel.findAll(filters);
    const total = await EquipmentModel.count(filters);

    return {
      equipment,
      pagination: {
        total,
        limit: filters.limit ? parseInt(filters.limit) : total,
        offset: filters.offset ? parseInt(filters.offset) : 0,
      },
    };
  }

  static async getEquipmentById(id) {
    const equipment = await EquipmentModel.findById(id);
    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }
    return equipment;
  }

  static async updateEquipment(id, equipmentData) {
    const equipment = await EquipmentModel.findById(id);
    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    // Verify category exists if being updated
    if (equipmentData.category_id) {
      const category = await EquipmentCategoryModel.findById(equipmentData.category_id);
      if (!category) {
        throw new AppError('Equipment category not found', 404);
      }
    }

    // Verify department exists if being updated
    if (equipmentData.department_id) {
      const department = await DepartmentModel.findById(equipmentData.department_id);
      if (!department) {
        throw new AppError('Department not found', 404);
      }
    }

    // Verify team exists if being updated
    if (equipmentData.team_id) {
      const team = await MaintenanceTeamModel.findById(equipmentData.team_id);
      if (!team) {
        throw new AppError('Maintenance team not found', 404);
      }
    }

    await EquipmentModel.update(id, equipmentData);
    return await EquipmentModel.findById(id);
  }

  static async deleteEquipment(id) {
    const equipment = await EquipmentModel.findById(id);
    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    await EquipmentModel.delete(id);
    return { message: 'Equipment deleted successfully' };
  }

  static async getEquipmentRequests(equipmentId) {
    const equipment = await EquipmentModel.findById(equipmentId);
    if (!equipment) {
      throw new AppError('Equipment not found', 404);
    }

    return await MaintenanceRequestModel.findAll({ equipment_id: equipmentId });
  }
}
