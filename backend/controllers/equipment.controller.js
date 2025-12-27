import { EquipmentService } from '../services/equipment.service.js';

export class EquipmentController {
  static async createEquipment(req, res, next) {
    try {
      const {
        name,
        serial_number,
        category,
        purchase_date,
        warranty_end,
        location,
        department_id,
        team_id,
        status,
      } = req.body;

      if (!name || !department_id || !team_id) {
        return res.status(400).json({
          success: false,
          message: 'Equipment name, department ID, and team ID are required',
        });
      }

      const equipment = await EquipmentService.createEquipment({
        name,
        serial_number,
        category,
        purchase_date,
        warranty_end,
        location,
        department_id,
        team_id,
        status,
      });

      res.status(201).json({
        success: true,
        message: 'Equipment created successfully',
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllEquipment(req, res, next) {
    try {
      const filters = {
        department_id: req.query.department_id,
        team_id: req.query.team_id,
        status: req.query.status,
        category: req.query.category,
        search: req.query.search,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0,
      };

      const result = await EquipmentService.getAllEquipment(filters);

      res.status(200).json({
        success: true,
        data: result.equipment,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentById(req, res, next) {
    try {
      const equipment = await EquipmentService.getEquipmentById(req.params.id);

      res.status(200).json({
        success: true,
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateEquipment(req, res, next) {
    try {
      const equipment = await EquipmentService.updateEquipment(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Equipment updated successfully',
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteEquipment(req, res, next) {
    try {
      const result = await EquipmentService.deleteEquipment(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentRequests(req, res, next) {
    try {
      const requests = await EquipmentService.getEquipmentRequests(req.params.id);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }
}
