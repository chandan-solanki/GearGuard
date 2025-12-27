import { UserModel } from '../models/User.model.js';
import { TechnicianModel } from '../models/Technician.model.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcrypt';

export class UserService {
  static async getAllUsers(filters) {
    const users = await UserModel.findAll(filters);
    const total = await UserModel.count(filters);

    return {
      users,
      pagination: {
        total,
        limit: filters.limit ? parseInt(filters.limit) : total,
        offset: filters.offset ? parseInt(filters.offset) : 0,
      },
    };
  }

  static async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  static async updateUser(id, userData) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed
    if (userData.email && userData.email !== user.email) {
      const emailExists = await UserModel.emailExists(userData.email, id);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    // Hash password if provided
    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    await UserModel.update(id, userData);
    return await UserModel.findById(id);
  }

  static async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await UserModel.delete(id);
    return { message: 'User deleted successfully' };
  }

  static async assignToTechnician(userId, teamId) {
    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update user role to technician if not already
    if (user.role !== 'technician') {
      await UserModel.update(userId, { role: 'technician' });
    }

    // Check if user is already a technician
    const existingTechnician = await TechnicianModel.findByUserId(userId);
    if (existingTechnician) {
      // Update team assignment
      await TechnicianModel.update(existingTechnician.id, { team_id: teamId });
    } else {
      // Create new technician record
      await TechnicianModel.create({ user_id: userId, team_id: teamId });
    }

    return await TechnicianModel.findByUserId(userId);
  }

  static async removeFromTechnician(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await TechnicianModel.deleteByUserId(userId);
    await UserModel.update(userId, { role: 'employee' });

    return { message: 'User removed from technician role' };
  }
}
