import { Router } from 'express';
import { registerUser } from '../controllers/authController';

// Create authentication router instance
const authRouter = Router();

// POST route for user registration
authRouter.post('/register', registerUser);

export { authRouter }; 