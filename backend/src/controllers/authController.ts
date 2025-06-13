// backend/src/controllers/authController.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../server';
import { sendSuccess, sendError, isValidEmail } from '../utils';
import { generateToken } from '../middleware/auth';

/**
 * Register new user (Simple version for development)
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email) {
      sendError(res, 'نام و ایمیل الزامی است', 400);
      return;
    }

    if (!isValidEmail(email)) {
      sendError(res, 'فرمت ایمیل نامعتبر است', 400);
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      sendError(res, 'کاربری با این ایمیل قبلاً ثبت‌نام کرده است', 409);
      return;
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user);

    sendSuccess(res, {
      user,
      token
    }, 'کاربر با موفقیت ثبت‌نام شد', 201);

  } catch (error) {
    console.error('❌ Register error:', error);
    sendError(res, 'خطا در ثبت‌نام کاربر');
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email) {
      sendError(res, 'ایمیل الزامی است', 400);
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      sendError(res, 'کاربر یافت نشد', 404);
      return;
    }

    // Check password if exists
    if (user.password && password) {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        sendError(res, 'رمز عبور اشتباه است', 401);
        return;
      }
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    }, 'ورود موفقیت‌آمیز بود');

  } catch (error) {
    console.error('❌ Login error:', error);
    sendError(res, 'خطا در ورود کاربر');
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      }
    });

    if (!userProfile) {
      sendError(res, 'کاربر یافت نشد', 404);
      return;
    }

    sendSuccess(res, userProfile, 'پروفایل کاربر');

  } catch (error) {
    console.error('❌ Get profile error:', error);
    sendError(res, 'خطا در دریافت پروفایل');
  }
};

/**
 * Demo login (for development)
 */
export const demoLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find or create demo user
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@haderboon.ir' }
    });

    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          name: 'مجتبی حسنی (دمو)',
          email: 'demo@haderboon.ir'
        }
      });
    }

    const token = generateToken({
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name
    });

    sendSuccess(res, {
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        createdAt: demoUser.createdAt
      },
      token
    }, 'ورود دمو موفقیت‌آمیز بود');

  } catch (error) {
    console.error('❌ Demo login error:', error);
    sendError(res, 'خطا در ورود دمو');
  }
};