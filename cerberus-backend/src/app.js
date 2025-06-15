// src/app.js
import express from 'express';
import helmet from 'helmet';
import mainApiRouter from './api/index.js'; // We will create this next

const app = express();

// --- Global Middleware ---
app.use(helmet());
app.use(express.json());

// --- Primary API Router ---
// All of our application routes will be mounted here.
app.use('/api/v1', mainApiRouter);

// We will add our global error handler here later.

export default app;