// src/api/index.js
import { Router } from 'express';

const router = Router();

// --- API Root Endpoints ---

// A simple health-check endpoint to verify the API is responsive.
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});

// --- Mount Sub-Routers ---
// We will import and use our other routers here later.
// e.g., import authRouter from './routes/auth.routes.js';
// router.use('/auth', authRouter);

export default router;