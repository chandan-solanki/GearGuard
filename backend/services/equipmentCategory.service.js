import { EquipmentCategoryModel } from '../models/EquipmentCategory.model.js';
import { AppError } from '../middleware/errorHandler.js';

export class EquipmentCategoryService {
  static async createCategory(categoryData) {
    // Check if category name already exists
    const existing = await EquipmentCategoryModel.findByName(categoryData.name);
    if (existing) {
      throw new AppError('Category with this name already exists', 400);
    }

    // Validate required fields
    if (!categoryData.name) {
      throw new AppError('Category name is required', 400);
    }

    const categoryId = await EquipmentCategoryModel.create(categoryData);
    const category = await EquipmentCategoryModel.findById(categoryId);

    return category;
  }

  static async getAllCategories(filters) {
    const categories = await EquipmentCategoryModel.findAll(filters);
    return categories;
  }

  static async getCategoryById(id) {
    const category = await EquipmentCategoryModel.findById(id);

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    // Add equipment count
    const equipmentCount = await EquipmentCategoryModel.getEquipmentCount(id);
    category.equipment_count = equipmentCount;

    return category;
  }

  static async updateCategory(id, categoryData) {
    const existingCategory = await EquipmentCategoryModel.findById(id);
    if (!existingCategory) {
      throw new AppError('Category not found', 404);
    }

    // Check if new name conflicts with another category
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const nameExists = await EquipmentCategoryModel.findByName(categoryData.name);
      if (nameExists) {
        throw new AppError('Category with this name already exists', 400);
      }
    }

    const affectedRows = await EquipmentCategoryModel.update(id, categoryData);

    if (affectedRows === 0) {
      throw new AppError('Failed to update category', 500);
    }

    const updatedCategory = await EquipmentCategoryModel.findById(id);
    return updatedCategory;
  }

  static async deleteCategory(id) {
    const category = await EquipmentCategoryModel.findById(id);
    if (!category) {
      throw new AppError('Category not found', 404);
    }

    try {
      const affectedRows = await EquipmentCategoryModel.delete(id);

      if (affectedRows === 0) {
        throw new AppError('Failed to delete category', 500);
      }

      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error.message.includes('Cannot delete category')) {
        throw new AppError(error.message, 400);
      }
      throw error;
    }
  }

  static async getCategoryStats() {
    const stats = await EquipmentCategoryModel.getCategoryStats();
    return stats;
  }
}
