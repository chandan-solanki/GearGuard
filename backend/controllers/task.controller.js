import { TaskService } from '../services/task.service.js';

export class TaskController {
  static async createTask(req, res, next) {
    try {
      const { title, description, status } = req.body;
      const userId = req.user.id;

      const task = await TaskService.createTask(
        { title, description, status },
        userId
      );

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let tasks;

      // Admin can see all tasks, users see only their own
      if (userRole === 'admin') {
        tasks = await TaskService.getAllTasks();
      } else {
        tasks = await TaskService.getTasksByUser(userId);
      }

      res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const task = await TaskService.getTaskById(id);

      // Users can only see their own tasks, admins can see all
      if (userRole !== 'admin' && task.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to view this task',
        });
      }

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const taskData = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      const task = await TaskService.updateTask(id, taskData, userId, userRole);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await TaskService.deleteTask(id, userId, userRole);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTaskStats(req, res, next) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      const stats = await TaskService.getTaskStats(userId, userRole);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
