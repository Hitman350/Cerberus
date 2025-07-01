// src/middleware/errorHandler.js
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';

/**
 * The global error handling middleware for the Express application.
 * This middleware MUST have 4 arguments to be recognized by Express as an error handler.
 *
 * @param {Error} err - The error object.
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function.
 */
export function globalErrorHandler(err, req, res, next) {
  // In a real application, we would use a proper logger like Winston here.
  // For now, console.error will do.
  console.error(err);

  // If the error is one of our custom AppErrors, we can trust its status code and message.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // For unexpected errors, we return a generic 500 Internal Server Error.
  // In production, we should not leak the details of the error to the client.
  const isProduction = config.NODE_ENV === 'production';
  return res.status(500).json({
    status: 'error',
    message: isProduction ? 'An unexpected error occurred.' : err.message,
    // Optionally include the stack trace in development for easier debugging.
    stack: isProduction ? undefined : err.stack,
  });
}