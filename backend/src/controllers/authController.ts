// مسیر فایل: src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

/**
 * اسکیمای اعتبارسنجی ثبت‌نام
 */
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional()
});

/**
 * اسکیمای اعتبارسنجی ورود
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

/**
 * ثبت‌نام کاربر جدید
 */
export const register = async (req: Request, res: Response) => {
  try {
    // اعتبارسنجی ورودی
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'داده‌های ورودی نامعتبر است',
        error: error.details[0].message
      });
    }

    const { email, username, password, firstName, lastName } = value;

    // بررسی وجود کاربر
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'کاربر با این ایمیل یا نام کاربری قبلاً ثبت‌نام کرده است'
      });
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 12);

    // ایجاد کاربر جدید
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // تولید JWT توکن
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'کاربر با موفقیت ثبت‌نام شد',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور'
    });
  }
};

/**
 * ورود کاربر
 */
export const login = async (req: Request, res: Response) => {
  try {
    // اعتبارسنجی ورودی
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'داده‌های ورودی نامعتبر است',
        error: error.details[0].message
      });
    }

    const { email, password } = value;

    // یافتن کاربر
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
    }

    // بررسی فعال بودن کاربر
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'حساب کاربری غیرفعال است'
      });
    }

    // بررسی رمز عبور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است'
      });
    }

    // تولید JWT توکن
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // حذف رمز عبور از پاسخ
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('خطا در ورود:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور'
    });
  }
};

/**
 * دریافت اطلاعات کاربر فعلی
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'کاربر یافت نشد'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('خطا در دریافت پروفایل:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور'
    });
  }
};

/**
 * خروج کاربر (در صورت نیاز به blacklist کردن توکن)
 */
export const logout = async (req: Request, res: Response) => {
  try {
    // در حال حاضر فقط پیام موفقیت برمی‌گرداند
    // در آینده می‌توان توکن را به blacklist اضافه کرد
    
    res.json({
      success: true,
      message: 'خروج موفقیت‌آمیز'
    });

  } catch (error) {
    console.error('خطا در خروج:', error);
    res.status(500).json({
      success: false,
      message: 'خطای داخلی سرور'
    });
  }
};