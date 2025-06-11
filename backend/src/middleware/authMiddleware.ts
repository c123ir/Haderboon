// backend/src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// تعریف interface برای User در Request
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

/**
 * میدل‌ویر احراز هویت
 * بررسی اعتبار JWT token و اضافه کردن اطلاعات کاربر به request
 */
export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // بررسی وجود token در header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // اگر token وجود نداشت
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز - توکن ارائه نشده است'
      });
      return;
    }

    // تأیید اعتبار token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      iat: number;
      exp: number;
    };

    // یافتن کاربر در پایگاه داده
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isActive: true
      }
    });

    // بررسی وجود کاربر و فعال بودن آن
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'کاربر یافت نشد یا غیرفعال است'
      });
      return;
    }

    // اضافه کردن اطلاعات کاربر به request
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('خطا در میدل‌ویر احراز هویت:', error);
    res.status(401).json({
      success: false,
      message: 'توکن نامعتبر است'
    });
  }
};

/**
 * میدل‌ویر بررسی نقش کاربر
 * @param roles - نقش‌های مجاز
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'دسترسی غیرمجاز'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'دسترسی ممنوع - نقش کاربری مناسب نیست'
      });
      return;
    }

    next();
  };
};