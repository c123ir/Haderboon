// Backend: backend/src/controllers/authController.ts
// کنترلر احراز هویت کاربران

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';
import { config } from '../config/app';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password } = req.body;

      const result = await AuthService.register({
        name,
        email,
        password
      });

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.server.environment === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.status(201).json(
        ApiResponse.success('ثبت نام با موفقیت انجام شد', {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({
        email,
        password
      });

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.server.environment === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      res.json(
        ApiResponse.success('ورود با موفقیت انجام شد', {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const user = await AuthService.getUserById(req.user.id);

      res.json(
        ApiResponse.success('اطلاعات کاربر با موفقیت دریافت شد', user)
      );
    } catch (error) {
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { name, email } = req.body;
      const updatedUser = await AuthService.updateProfile(req.user.id, {
        name,
        email
      });

      res.json(
        ApiResponse.success('پروفایل با موفقیت به‌روزرسانی شد', updatedUser)
      );
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { currentPassword, newPassword } = req.body;
      
      await AuthService.changePassword(req.user.id, currentPassword, newPassword);

      res.json(
        ApiResponse.success('رمز عبور با موفقیت تغییر کرد')
      );
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new ApiError(401, 'توکن تازه‌سازی موجود نیست');
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.json(
        ApiResponse.success('توکن با موفقیت تازه‌سازی شد', {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear HTTP-only cookie
      res.clearCookie('refreshToken');

      logger.info(`User logged out: ${req.user?.email}`);

      res.json(
        ApiResponse.success('خروج با موفقیت انجام شد')
      );
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  static async forgotPassword(req: Request, res: Response, next: NextFunction