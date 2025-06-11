// backend/src/routes/authRoutes.ts
// این فایل شامل مسیرهای مربوط به احراز هویت (ثبت‌نام و ورود) است

import express, { Request, Response } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

// تعریف interface برای درخواست احراز هویت شده
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// ایجاد روتر Express
const router = express.Router();

/**
 * @route POST /api/v1/auth/register
 * @desc ثبت‌نام کاربر جدید
 * @access عمومی
 */
router.post('/register', registerUser);

/**
 * @route POST /api/v1/auth/login
 * @desc ورود کاربر
 * @access عمومی
 */
router.post('/login', loginUser);

/**
 * @route GET /api/v1/auth/me
 * @desc دریافت اطلاعات کاربر فعلی
 * @access خصوصی (فقط کاربران احراز هویت شده)
 */
router.get('/me', protect, (req: AuthenticatedRequest, res: Response) => {
  // از آنجایی که میدل‌ور protect قبلاً اجرا شده، اطلاعات کاربر در req.user موجود است
  const user = req.user;
  
  res.status(200).json({
    success: true,
    message: 'اطلاعات کاربر فعلی',
    user,
  });
});

export default router; 