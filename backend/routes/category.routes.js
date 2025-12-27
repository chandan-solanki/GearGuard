import express from 'express';
import { EquipmentCategoryController } from '../controllers/equipmentCategory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { roleCheck } from '../middleware/roleCheck.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /api/categories - Get all categories (All authenticated users)
router.get('/', EquipmentCategoryController.getAllCategories);

// GET /api/categories/stats - Get category statistics (Manager and Admin only)
router.get(
  '/stats',
  roleCheck(['admin', 'manager']),
  EquipmentCategoryController.getCategoryStats
);

// GET /api/categories/:id - Get category by ID (All authenticated users)
router.get('/:id', EquipmentCategoryController.getCategoryById);

// POST /api/categories - Create new category (Admin and Manager only)
router.post(
  '/',
  roleCheck(['admin', 'manager']),
  EquipmentCategoryController.createCategory
);

// PUT /api/categories/:id - Update category (Admin and Manager only)
router.put(
  '/:id',
  roleCheck(['admin', 'manager']),
  EquipmentCategoryController.updateCategory
);

// DELETE /api/categories/:id - Delete category (Admin only)
router.delete(
  '/:id',
  roleCheck(['admin']),
  EquipmentCategoryController.deleteCategory
);

export default router;
