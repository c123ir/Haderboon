// backend/src/utils/encryption.ts
// سرویس رمزنگاری برای امنیت کلیدهای API

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

// کلید رمزنگاری از متغیرهای محیطی یا یک مقدار پیش‌فرض
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'haderboon-default-encryption-key-32char';
// وکتور اولیه (IV) برای رمزنگاری
const IV_LENGTH = 16; // طول IV برای الگوریتم AES-256-CBC

/**
 * رمزنگاری یک رشته
 * @param text متن ورودی برای رمزنگاری
 * @returns متن رمزنگاری شده
 */
export const encrypt = (text: string): string => {
  try {
    // ایجاد IV تصادفی
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // ایجاد سایفر با الگوریتم AES-256-CBC
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY), 
      iv
    );
    
    // رمزنگاری متن
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // ترکیب IV و متن رمزنگاری شده به صورت یک رشته واحد
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('خطا در رمزنگاری:', error);
    throw new Error('خطا در رمزنگاری داده');
  }
};

/**
 * رمزگشایی یک رشته رمزنگاری شده
 * @param encryptedText متن رمزنگاری شده
 * @returns متن اصلی
 */
export const decrypt = (encryptedText: string): string => {
  try {
    // جداسازی IV و متن رمزنگاری شده
    const textParts = encryptedText.split(':');
    
    if (textParts.length !== 2) {
      throw new Error('فرمت داده رمزنگاری شده نامعتبر است');
    }
    
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedData = textParts[1];
    
    // ایجاد دی‌سایفر
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(ENCRYPTION_KEY),
      iv
    );
    
    // رمزگشایی متن
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('خطا در رمزگشایی:', error);
    throw new Error('خطا در رمزگشایی داده');
  }
}; 