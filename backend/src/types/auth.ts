// مسیر فایل: src/types/auth.ts

import { Request } from 'express';
import { User } from '@prisma/client'; // یا مسیر صحیح به مدل User شما

/**
 * رابط کاربری برای درخواست‌های احراز هویت شده
 * این رابط، اطلاعات کاربر را به شیء Request اضافه می‌کند
 */
export interface AuthRequest extends Request {
  user?: User; // اطلاعات کاربر می‌تواند اختیاری باشد اگر برخی مسیرها نیازی به احراز هویت کامل نداشته باشند
}