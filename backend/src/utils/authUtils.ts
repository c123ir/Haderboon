// backend/src/utils/authUtils.ts
// این فایل شامل توابع کمکی برای احراز هویت و امنیت است

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// بارگذاری متغیرهای محیطی
dotenv.config();

// کلید مخفی JWT از متغیرهای محیطی
const JWT_SECRET = process.env.JWT_SECRET || 'haderboon_jwt_secret_key_for_authentication_20240701';
// مدت زمان اعتبار توکن JWT
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * هش کردن پسورد کاربر
 * @param password پسورد خام
 * @returns پسورد هش شده
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * مقایسه پسورد ورودی با پسورد هش شده
 * @param password پسورد خام ورودی
 * @param hashedPassword پسورد هش شده ذخیره شده
 * @returns آیا پسورد صحیح است یا خیر
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * ایجاد توکن JWT برای کاربر
 * @param userId شناسه کاربر
 * @returns توکن JWT
 */
export const generateToken = (userId: string): string => {
  try {
    // استفاده از بدنه try-catch برای گرفتن هرگونه خطای احتمالی
    const payload = { id: userId };
    const options = { expiresIn: JWT_EXPIRES_IN };
    
    // @ts-ignore - نادیده گرفتن خطای تایپ
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (error) {
    console.error('خطا در ایجاد توکن JWT:', error);
    return '';
  }
};

/**
 * بررسی اعتبار توکن JWT
 * @param token توکن JWT
 * @returns شناسه کاربر استخراج شده از توکن
 */
export const verifyToken = (token: string): string | null => {
  try {
    // @ts-ignore - نادیده گرفتن خطای تایپ
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch (error) {
    console.error('خطا در تأیید توکن JWT:', error);
    return null;
  }
}; 