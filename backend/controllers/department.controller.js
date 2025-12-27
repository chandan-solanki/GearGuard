import { DepartmentService } from '../services/department.service.js';

export class DepartmentController {
  static async createDepartment(req, res, next) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Department name is required',
        });
      }

      const department = await DepartmentService.createDepartment({ name, description });

      res.status(201).json({
        success: true,
        message: 'Department created successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllDepartments(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        limit: req.query.limit,
        offset: req.query.offset || 0,
      };

      const result = await DepartmentService.getAllDepartments(filters);

      res.status(200).json({
        success: true,
        data: result.departments,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDepartmentById(req, res, next) {
    try {
      const department = await DepartmentService.getDepartmentById(req.params.id);

      res.status(200).json({
        success: true,
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateDepartment(req, res, next) {
    try {
      const { name, description } = req.body;

      const department = await DepartmentService.updateDepartment(req.params.id, {
        name,
        description,
      });

      res.status(200).json({
        success: true,
        message: 'Department updated successfully',
        data: department,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDepartment(req, res, next) {
    try {
      const result = await DepartmentService.deleteDepartment(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
