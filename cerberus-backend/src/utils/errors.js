// src/utils/errors.js

/**
 * Base class for all custom application errors.
 * This allows us to use `instanceof AppError` to catch only our custom errors.
 */
export class AppError extends Error {
  /**
   * @param {string} message - The error message.
   * @param {number} statusCode - The HTTP status code to be sent in the response.
   */
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    // Capturing the stack trace allows us to see where the error was thrown.
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Represents a "Not Found" error (HTTP 404).
 * Used when a requested resource (e.g., a user, a wallet) does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Represents an "Authentication" error (HTTP 401).
 * Used for failed login attempts or invalid credentials.
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

/**
 * Represents a "Conflict" error (HTTP 409).
 * Used when an action cannot be completed because of a conflict with the current
 * state of the resource (e.g., trying to register an email that already exists).
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict with existing resource') {
    super(message, 409);
  }
}

/**
 * Represents a "Validation" error (HTTP 400).
 * Although Zod handles most validation, this can be used for complex business rule validation.
 */
export class ValidationError extends AppError {
  constructor(message = 'Invalid input data') {
    super(message, 400);
  }
}