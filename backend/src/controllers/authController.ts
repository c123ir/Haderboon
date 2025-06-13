// backend/src/controllers/authController.ts

import { Request, Response } from 'express';

export const registerUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  // 1. Validation
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required.' });
  }

  // 2. Business Logic (for now, just a success response)
  // In the future, we will add database interaction here.
  return res.status(201).json({
    message: 'User registered successfully',
    user: { email, name },
  });
};