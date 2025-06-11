// backend/src/controllers/authController.ts
// این فایل شامل کنترلرهای مربوط به احراز هویت (ثبت‌نام و ورود) است

import { Request, Response } from 'express';
import { hashPassword, comparePassword, generateToken } from '../utils/authUtils';
import { PrismaClient } from '../generated/prisma';

// تعریف تایپ‌های مورد نیاز
interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
}

interface LoginUserInput {
  email: string;
  password: string;
}

// ایجاد نمونه Prisma برای تعامل با پایگاه داده
const prisma = new PrismaClient();

/**
 * کنترلر ثبت‌نام کاربر جدید
 * @route POST /api/v1/auth/register
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password }: RegisterUserInput = req.body;

    // بررسی وجود همه فیلدهای لازم
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً تمامی فیلدهای مورد نیاز را وارد کنید',
      });
    }

    // بررسی طول پسورد
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'پسورد باید حداقل 6 کاراکتر باشد',
      });
    }

    // بررسی وجود کاربر با ایمیل یکسان
    const existingUserEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserEmail) {
      return res.status(409).json({
        success: false,
        message: 'این ایمیل قبلاً ثبت شده است',
      });
    }

    // بررسی وجود کاربر با نام کاربری یکسان
    const existingUserUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserUsername) {
      return res.status(409).json({
        success: false,
        message: 'این نام کاربری قبلاً ثبت شده است',
      });
    }

    // هش کردن پسورد
    const hashedPassword = await hashPassword(password);

    // ایجاد کاربر جدید در پایگاه داده
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // ایجاد توکن JWT
    const token = generateToken(newUser.id);

    // ارسال پاسخ موفقیت‌آمیز
    return res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
      },
      token,
    });
  } catch (error) {
    console.error('خطا در ثبت‌نام کاربر:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در ثبت‌نام کاربر',
    });
  }
};

/**
 * کنترلر ورود کاربر
 * @route POST /api/v1/auth/login
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginUserInput = req.body;

    // بررسی وجود همه فیلدهای لازم
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً ایمیل و پسورد را وارد کنید',
      });
    }

    // یافتن کاربر با ایمیل وارد شده
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // اگر کاربر پیدا نشد یا پسورد نادرست بود
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا پسورد نادرست است',
      });
    }

    // ایجاد توکن JWT
    const token = generateToken(user.id);

    // ارسال پاسخ موفقیت‌آمیز
    return res.status(200).json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      token,
    });
  } catch (error) {
    console.error('خطا در ورود کاربر:', error);
    return res.status(500).json({
      success: false,
      message: 'خطای سرور در ورود کاربر',
    });
  }
}; 