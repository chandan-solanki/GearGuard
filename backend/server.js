// Entry point for the API server. Sets up Express, middleware, database
// initialization, routes, and error handling.
import express from 'express';
import cors from 'cors';
import { config } from './config/env.config.js';
import { createPool } from './config/database.js';
import { initDatabase } from './config/dbInit.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Initialize database connection pool (singleton)
// Reads DB config from `backend/config/env.config.js` which uses environment
// variables. A pool is used to reuse connections and improve performance.
createPool();

// Ensure required tables exist and perform any simple DB init/migrations.
// This runs at startup so the app can assume DB schema is present.
await initDatabase();

// Common middleware
// - CORS: allow browser requests from other origins (configure as needed)
// - express.json(), express.urlencoded(): parse JSON and URL-encoded request bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - enabled only in development to avoid verbose
// logs in production. Logs method, path, and request payloads which is useful
// while debugging API requests locally.
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

// Mount API routers under `/api`. The `routes` module wires all feature
// sub-routers (auth, users, equipment, requests, etc.).
app.use('/api', routes);

// Root route provides a simple JSON payload describing the API and common
// endpoints — useful for quick health checks or documentation during
// development. Keep this lightweight and safe for public exposure.
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
      technicians: {
        list: 'GET /api/technicians',
        getById: 'GET /api/technicians/:id',
        update: 'PUT /api/technicians/:id',
        myProfile: 'GET /api/technicians/me',
        myRequests: 'GET /api/technicians/me/requests',
        teamRequests: 'GET /api/technicians/me/team-requests',
        myStats: 'GET /api/technicians/me/stats',
        acceptRequest: 'PUT /api/technicians/me/accept-request/:requestId',
      },
    },
  });
});

// 404 handler for unmatched routes - returns a JSON error response
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler - centralized error responses and logging
// The `errorHandler` middleware will format errors from controllers/services
// and return appropriate HTTP status codes and messages.
app.use(errorHandler);

// Start the HTTP server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

export default app;
