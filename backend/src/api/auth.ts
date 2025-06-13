// backend/src/api/auth.ts

import { Router } from 'express';
import { registerUser } from '../controllers/authController';

const authRouter = Router();

// تعریف مسیر برای ثبت نام
// POST /api/auth/register
authRouter.post('/register', registerUser);

export { authRouter };