import { DepartmentModel } from '../models/Department.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class DepartmentService {
  static async createDepartment(departmentData) {
    const id = await DepartmentModel.create(departmentData);
    return await DepartmentModel.findById(id);
  }

  static async getAllDepartments(filters) {
    const departments = await DepartmentModel.findAll(filters);
    const total = await DepartmentModel.count(filters);

    return {
      departments,
      pagination: {
        total,
        limit: filters.limit ? parseInt(filters.limit) : total,
        offset: filters.offset ? parseInt(filters.offset) : 0,
      },
    };
  }

  static async getDepartmentById(id) {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }
    return department;
  }

  static async updateDepartment(id, departmentData) {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    await DepartmentModel.update(id, departmentData);
    return await DepartmentModel.findById(id);
  }

  static async deleteDepartment(id) {
    const department = await DepartmentModel.findById(id);
    if (!department) {
      throw new AppError('Department not found', 404);
    }

    await DepartmentModel.delete(id);
    return { message: 'Department deleted successfully' };
  }
}
