// مسیر فایل: src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth'; // استفاده از نوع AuthRequest تعریف شده

const prisma = new PrismaClient();

/**
 * میدل‌ویر احراز هویت
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز - توکن ارائه نشده'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // استفاده از userId بجای id
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('خطا در تأیید توکن:', error);
    return res.status(401).json({
      success: false,
      message: 'توکن نامعتبر یا منقضی شده'
    });
  }
};

/**
 * میدل‌ویر بررسی نقش کاربر
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'دسترسی ممنوع - نقش کافی ندارید'
      });
    }

    next();
  };
};