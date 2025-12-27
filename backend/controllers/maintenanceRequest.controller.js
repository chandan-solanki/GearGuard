import { MaintenanceRequestService } from '../services/maintenanceRequest.service.js';

export class MaintenanceRequestController {
  static async createRequest(req, res, next) {
    try {
      const { subject, type, description, equipment_id, technician_id, scheduled_date } = req.body;

      if (!subject || !type || !equipment_id) {
        return res.status(400).json({
          success: false,
          message: 'Subject, type, and equipment ID are required',
        });
      }

      const request = await MaintenanceRequestService.createRequest(
        {
          subject,
          type,
          description,
          equipment_id,
          technician_id,
          scheduled_date,
        },
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Maintenance request created successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllRequests(req, res, next) {
    try {
      const filters = {
        equipment_id: req.query.equipment_id,
        department_id: req.query.department_id,
        team_id: req.query.team_id,
        technician_id: req.query.technician_id,
        status: req.query.status,
        type: req.query.type,
        overdue: req.query.overdue === 'true',
        search: req.query.search,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0,
      };

      const result = await MaintenanceRequestService.getAllRequests(filters);

      res.status(200).json({
        success: true,
        data: result.requests,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRequestById(req, res, next) {
    try {
      const request = await MaintenanceRequestService.getRequestById(req.params.id);

      res.status(200).json({
        success: true,
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRequest(req, res, next) {
    try {
      const request = await MaintenanceRequestService.updateRequest(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Request updated successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignTechnician(req, res, next) {
    try {
      const { technician_id } = req.body;

      if (!technician_id) {
        return res.status(400).json({
          success: false,
          message: 'Technician ID is required',
        });
      }

      const request = await MaintenanceRequestService.assignTechnician(
        req.params.id,
        technician_id,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: 'Technician assigned successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status, duration_hours } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required',
        });
      }

      const validStatuses = ['new', 'in_progress', 'repaired', 'scrap'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const request = await MaintenanceRequestService.updateStatus(
        req.params.id,
        status,
        req.user.id,
        duration_hours
      );

      res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: request,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRequest(req, res, next) {
    try {
      const result = await MaintenanceRequestService.deleteRequest(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCalendarView(req, res, next) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
      };

      const requests = await MaintenanceRequestService.getCalendarView(filters);

      res.status(200).json({
        success: true,
        data: requests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRequestLogs(req, res, next) {
    try {
      const logs = await MaintenanceRequestService.getRequestLogs(req.params.id);

      res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatsByTeam(req, res, next) {
    try {
      const stats = await MaintenanceRequestService.getStatsByTeam();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStatsByEquipment(req, res, next) {
    try {
      const stats = await MaintenanceRequestService.getStatsByEquipment();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
