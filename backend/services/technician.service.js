import { TechnicianModel } from '../models/Technician.model.js';
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

  static async updateTechnician(id, technicianData) {
    const technician = await TechnicianModel.findById(id);
    if (!technician) {
      throw new AppError('Technician not found', 404);
    }

    await TechnicianModel.update(id, technicianData);
    return await TechnicianModel.findById(id);
  }
}
