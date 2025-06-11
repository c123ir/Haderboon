// backend/src/middleware/authMiddleware.ts
// این فایل شامل میدل‌ور احراز هویت برای محافظت از مسیرهای خاص است

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '../generated/prisma';
import { verifyToken } from '../utils/authUtils';

// تعریف interface برای درخواست احراز هویت شده
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// ایجاد نمونه Prisma برای تعامل با پایگاه داده
const prisma = new PrismaClient();

/**
 * میدل‌ور احراز هویت برای بررسی توکن JWT
 * و بارگذاری اطلاعات کاربر در درخواست
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // دریافت توکن از هدر Authorization
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // جدا کردن توکن از "Bearer "
      token = req.headers.authorization.split(' ')[1];
    }

    // اگر توکن وجود نداشت
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'توکن احراز هویت وجود ندارد، لطفاً وارد سیستم شوید',
      });
    }

    // بررسی اعتبار توکن
    const userId = verifyToken(token);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده است، لطفاً مجدداً وارد سیستم شوید',
      });
    }

    // یافتن کاربر با شناسه استخراج شده از توکن
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
      },
    });

    // اگر کاربر در پایگاه داده وجود نداشت
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر متعلق به این توکن یافت نشد',
      });
    }

    // افزودن اطلاعات کاربر به درخواست برای استفاده در کنترلرهای بعدی
    (req as AuthenticatedRequest).user = user;

    // ادامه به کنترلر بعدی
    next();
  } catch (error) {
    console.error('خطا در میدل‌ور احراز هویت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در احراز هویت',
    });
  }
};

/**
 * میدل‌ور بررسی دسترسی ادمین
 * فقط کاربران با نقش admin اجازه دسترسی دارند
 */
export const admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // بررسی وجود اطلاعات کاربر (باید قبلاً authenticate شده باشد)
    const authenticatedReq = req as AuthenticatedRequest;
    if (!authenticatedReq.user) {
      return res.status(401).json({
        success: false,
        message: 'کاربر احراز هویت نشده است',
      });
    }

    // دریافت اطلاعات کامل کاربر از پایگاه داده
    const user = await prisma.user.findUnique({
      where: { id: authenticatedReq.user.id },
      select: { id: true, email: true, username: true, role: true }
    });

    // بررسی نقش کاربر
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'دسترسی مجاز نیست - نیاز به دسترسی ادمین',
      });
    }

    // ادامه به کنترلر بعدی
    next();
  } catch (error) {
    console.error('خطا در میدل‌ور ادمین:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در بررسی دسترسی ادمین',
    });
  }
};