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

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      console.log('اطلاعات توکن:', decoded);
      
      if (!decoded.userId) {
        console.error('فیلد userId در توکن یافت نشد:', decoded);
        return res.status(401).json({
          success: false,
          message: 'توکن نامعتبر - فیلد userId یافت نشد'
        });
      }
      
      // جستجوی کاربر با استفاده از userId از توکن
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        console.error('کاربر با شناسه مشخص شده یافت نشد:', decoded.userId);
        return res.status(401).json({
          success: false,
          message: 'کاربر یافت نشد'
        });
      }

      // تنظیم اطلاعات کاربر
      req.user = user;
      console.log('کاربر احراز هویت شد:', { id: user.id, email: user.email, role: user.role });

      next();
    } catch (jwtError) {
      console.error('خطا در تأیید توکن JWT:', jwtError);
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده',
        error: jwtError instanceof Error ? jwtError.message : 'خطای نامشخص'
      });
    }
  } catch (error) {
    console.error('خطا در میدل‌ویر احراز هویت:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور در احراز هویت',
      error: error instanceof Error ? error.message : 'خطای نامشخص'
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
      console.log('کاربر دسترسی کافی ندارد:', { 
        userRole: req.user.role, 
        requiredRoles: roles 
      });
      
      return res.status(403).json({
        success: false,
        message: 'دسترسی ممنوع - نقش کافی ندارید'
      });
    }

    next();
  };
};