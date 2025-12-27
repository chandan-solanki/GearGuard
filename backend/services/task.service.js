import { TaskModel } from '../models/Task.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class TaskService {
  static async createTask(taskData, userId) {
    const { title, description, status } = taskData;

    if (!title) {
      throw new AppError('Title is required', 400);
    }

    const taskId = await TaskModel.create({
      title,
      description,
      status: status || 'pending',
      user_id: userId,
    });

    const task = await TaskModel.findById(taskId);
    return task;
  }

  static async getTasksByUser(userId) {
    const tasks = await TaskModel.findByUserId(userId);
    return tasks;
  }

  static async getAllTasks() {
    const tasks = await TaskModel.findAll();
    return tasks;
  }

  static async getTaskById(taskId) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  static async updateTask(taskId, taskData, userId, userRole) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Users can only update their own tasks, admins can update any task
    if (userRole !== 'admin' && task.user_id !== userId) {
      throw new AppError('You are not authorized to update this task', 403);
    }

    const updated = await TaskModel.update(taskId, taskData);

    if (!updated) {
      throw new AppError('Failed to update task', 500);
    }

    const updatedTask = await TaskModel.findById(taskId);
    return updatedTask;
  }

  static async deleteTask(taskId, userId, userRole) {
    const task = await TaskModel.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Only admin can delete tasks
    if (userRole !== 'admin') {
      throw new AppError('Only admin can delete tasks', 403);
    }

    const deleted = await TaskModel.delete(taskId);

    if (!deleted) {
      throw new AppError('Failed to delete task', 500);
    }

    return { message: 'Task deleted successfully' };
  }

  static async getTaskStats(userId, userRole) {
    let tasks;

    if (userRole === 'admin') {
      tasks = await TaskModel.findAll();
    } else {
      tasks = await TaskModel.findByUserId(userId);
    }

    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };

    return stats;
  }
}
