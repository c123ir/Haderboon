// backend/src/api/index.ts

import { Router } from 'express';
import { authRouter } from './auth';

// Create main API router instance
const apiRouter = Router();

// Use auth router for authentication-related routes
apiRouter.use('/auth', authRouter);

export { apiRouter }; 