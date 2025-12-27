import { AppError } from './errorHandler.js';

export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
