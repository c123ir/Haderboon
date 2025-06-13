// backend/src/middleware/auth.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AuthRequest, TokenPayload } from '../types';
import { sendError } from '../utils';

/**
 * Middleware for JWT authentication
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      sendError(res, 'توکن دسترسی مورد نیاز است', 401);
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      sendError(res, 'کاربر یافت نشد', 401);
      return;
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'توکن نامعتبر است', 401);
    } else if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'توکن منقضی شده است', 401);
    } else {
      sendError(res, 'خطا در احراز هویت', 500);
    }
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true }
      });
      
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (user: { id: string; email: string; name: string }): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    name: user.name
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};