import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import departmentRoutes from './department.routes.js';
import teamRoutes from './team.routes.js';
import technicianRoutes from './technician.routes.js';
import equipmentRoutes from './equipment.routes.js';
import categoryRoutes from './category.routes.js';
import requestRoutes from './request.routes.js';
import attachmentRoutes from './attachment.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GearGuard API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/departments', departmentRoutes);
router.use('/teams', teamRoutes);
router.use('/technicians', technicianRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/requests', requestRoutes);
router.use('/attachments', attachmentRoutes);

export default router;

