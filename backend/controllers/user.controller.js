import { UserService } from '../services/user.service.js';

export class UserController {
  static async getAllUsers(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        search: req.query.search,
        limit: req.query.limit || 50,
        offset: req.query.offset || 0,
      };

      const result = await UserService.getAllUsers(filters);

      res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = await UserService.getUserById(req.params.id);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { name, email, role, password } = req.body;
      const userData = {};

      if (name) userData.name = name;
      if (email) userData.email = email;
      if (role) userData.role = role;
      if (password) userData.password = password;

      const user = await UserService.updateUser(req.params.id, userData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const result = await UserService.deleteUser(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignToTechnician(req, res, next) {
    try {
      const { team_id } = req.body;

      if (!team_id) {
        return res.status(400).json({
          success: false,
          message: 'Team ID is required',
        });
      }

      const technician = await UserService.assignToTechnician(req.params.id, team_id);

      res.status(200).json({
        success: true,
        message: 'User assigned to technician role successfully',
        data: technician,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeFromTechnician(req, res, next) {
    try {
      const result = await UserService.removeFromTechnician(req.params.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
