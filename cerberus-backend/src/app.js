// src/app.js
import express from 'express';
import helmet from 'helmet';
import mainApiRouter from './api/index.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(express.json());

// --- Primary API Router ---
// All of our application routes will be mounted here.
app.use('/api/v1', mainApiRouter);

// --- 404 Handler for unknown routes ---
// This middleware runs if no other route has matched the request.
// It creates a NotFoundError and passes it to the global error handler.
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found.`));
});

// --- Global Error Handler ---
// This MUST be the last piece of middleware.
// It will catch all errors passed by `next(error)`.
app.use(globalErrorHandler);

export default app;