import { EquipmentCategoryService } from '../services/equipmentCategory.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/responseHandler.js';

export class EquipmentCategoryController {
  // Create a new category
  static createCategory = asyncHandler(async (req, res) => {
    const categoryData = req.body;
    const category = await EquipmentCategoryService.createCategory(categoryData);

    successResponse(res, category, 'Category created successfully', 201);
  });

  // Get all categories with optional filters
  static getAllCategories = asyncHandler(async (req, res) => {
    const filters = {
      name: req.query.name,
      company_name: req.query.company_name,
      responsible: req.query.responsible,
      limit: req.query.limit,
      offset: req.query.offset,
    };

    const categories = await EquipmentCategoryService.getAllCategories(filters);

    successResponse(
      res,
      categories,
      'Categories retrieved successfully'
    );
  });

  // Get category by ID
  static getCategoryById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await EquipmentCategoryService.getCategoryById(id);

    successResponse(res, category, 'Category retrieved successfully');
  });

  // Update category
  static updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const categoryData = req.body;

    const updatedCategory = await EquipmentCategoryService.updateCategory(
      id,
      categoryData
    );

    successResponse(res, updatedCategory, 'Category updated successfully');
  });

  // Delete category
  static deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await EquipmentCategoryService.deleteCategory(id);

    successResponse(res, result, 'Category deleted successfully');
  });

  // Get category statistics
  static getCategoryStats = asyncHandler(async (req, res) => {
    const stats = await EquipmentCategoryService.getCategoryStats();

    successResponse(
      res,
      stats,
      'Category statistics retrieved successfully'
    );
  });
}
