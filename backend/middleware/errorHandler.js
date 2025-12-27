/**
 * Central error handling middleware for the Express application
 * Catches errors from all routes and sends a standardized error response
 * 
 * @param {Error} err - The error object that was thrown or passed to next()
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error('❌ Error:', err);

  // Use custom statusCode if available, otherwise default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;
  
  // Use custom error message if available, otherwise use default message
  const message = err.message || 'Internal Server Error';

  // Send error response in JSON format
  res.status(statusCode).json({
    success: false,
    message: message,
    // In development mode, include the full stack trace for debugging
    // Stack trace is excluded in production for security reasons
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Custom application error class that extends the built-in Error class
 * Used to create consistent, operational errors throughout the application
 * 
 * Example usage:
 *   throw new AppError('Invalid input', 400);
 *   throw new AppError('User not found', 404);
 */
export class AppError extends Error {
  /**
   * Creates an instance of AppError
   * 
   * @param {string} message - The error message to display to the client
   * @param {number} statusCode - The HTTP status code for the error response
   */
  constructor(message, statusCode) {
    // Call parent Error class constructor with the message
    super(message);
    
    // Store the HTTP status code for the error response
    this.statusCode = statusCode;
    
    // Mark this error as operational (handled error, not a programming error)
    this.isOperational = true;

    // Capture the stack trace for debugging, excluding the constructor call
    Error.captureStackTrace(this, this.constructor);
  }
}
