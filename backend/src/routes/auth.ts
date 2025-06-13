// backend/src/routes/auth.ts

import { Router } from 'express';
import { register, login, getProfile, demoLogin } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

export default router;