import express from 'express';
import authRoutes from './auth.routes.js';
import taskRoutes from './task.routes.js';

const router = express.Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

export default router;
