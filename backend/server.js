import express from 'express';
import cors from 'cors';
import { config } from './config/env.config.js';
import { createPool } from './config/database.js';
import { initDatabase } from './config/dbInit.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Initialize database connection pool
createPool();

// Initialize database tables (creates if not exists)
await initDatabase();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  });
}

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to GearGuard: Maintenance Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refreshToken: 'POST /api/auth/refresh-token',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
      },
      users: {
        list: 'GET /api/users',
        getById: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        assignTechnician: 'POST /api/users/:id/assign-technician',
      },
      departments: {
        list: 'GET /api/departments',
        create: 'POST /api/departments',
        getById: 'GET /api/departments/:id',
        update: 'PUT /api/departments/:id',
        delete: 'DELETE /api/departments/:id',
      },
      teams: {
        list: 'GET /api/teams',
        create: 'POST /api/teams',
        getById: 'GET /api/teams/:id',
        update: 'PUT /api/teams/:id',
        delete: 'DELETE /api/teams/:id',
        getTechnicians: 'GET /api/teams/:id/technicians',
      },
      equipment: {
        list: 'GET /api/equipment',
        create: 'POST /api/equipment',
        getById: 'GET /api/equipment/:id',
        update: 'PUT /api/equipment/:id',
        delete: 'DELETE /api/equipment/:id',
        getRequests: 'GET /api/equipment/:id/requests',
      },
      categories: {
        list: 'GET /api/categories',
        create: 'POST /api/categories',
        getById: 'GET /api/categories/:id',
        update: 'PUT /api/categories/:id',
        delete: 'DELETE /api/categories/:id',
        stats: 'GET /api/categories/stats',
      },
      requests: {
        list: 'GET /api/requests',
        create: 'POST /api/requests',
        calendar: 'GET /api/requests/calendar',
        statsTeam: 'GET /api/requests/stats/team',
        statsEquipment: 'GET /api/requests/stats/equipment',
        getById: 'GET /api/requests/:id',
        update: 'PUT /api/requests/:id',
        assignTechnician: 'PUT /api/requests/:id/assign-technician',
        updateStatus: 'PUT /api/requests/:id/status',
        getLogs: 'GET /api/requests/:id/logs',
        delete: 'DELETE /api/requests/:id',
      },
      attachments: {
        upload: 'POST /api/attachments/:requestId',
        list: 'GET /api/attachments/:requestId',
        delete: 'DELETE /api/attachments/file/:id',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

export default app;
