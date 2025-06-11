// مسیر فایل: backend/src/routes/authRoutes.ts
// این فایل شامل مسیرهای مربوط به احراز هویت (ثبت‌نام و ورود) است

import express, { Response } from 'express'; // Request حذف شد
import { register, login, getProfile, logout } from '../controllers/authController'; // getProfile و logout اضافه شد
import { protect } from '../middleware/authMiddleware';
import { AuthRequest } from '../types/auth'; // AuthRequest اضافه شد

// ایجاد روتر Express
const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc ثبت‌نام کاربر جدید
 * @access عمومی
 */
router.post('/register', register);

/**
 * @route POST /api/v1/auth/login
 * @desc ورود کاربر
 * @access عمومی
 */
router.post('/login', login);

/**
 * @route GET /api/v1/auth/me
 * @desc دریافت اطلاعات کاربر فعلی
 * @access خصوصی (فقط کاربران احراز هویت شده)
 */
router.get('/me', protect, getProfile); // استفاده از getProfile کنترلر

/**
 * @route POST /api/v1/auth/logout
 * @desc خروج کاربر
 * @access خصوصی
 */
router.post('/logout', protect, logout); // اضافه کردن مسیر خروج

export default router;