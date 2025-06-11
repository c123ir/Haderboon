// backend/src/services/CryptoService.ts
// سرویس رمزنگاری برای رمزگذاری و رمزگشایی کلیدهای API

import * as crypto from 'crypto';

/**
 * سرویس رمزنگاری برای رمزگذاری و رمزگشایی کلیدهای API
 */
class CryptoService {
  private algorithm: string;
  private secretKey: Buffer;
  private iv: Buffer;
  
  /**
   * سازنده کلاس
   * @param secretKey کلید رمزنگاری (اختیاری)
   */
  constructor(secretKey?: string) {
    this.algorithm = 'aes-256-cbc';
    
    // استفاده از کلید محیطی یا کلید پیش‌فرض
    const envKey = process.env.ENCRYPTION_KEY || 'haderboon-default-encryption-key-12345';
    const key = secretKey || envKey;
    
    // ایجاد کلید 32 بایتی و بردار اولیه 16 بایتی
    this.secretKey = crypto.createHash('sha256').update(key).digest();
    this.iv = crypto.randomBytes(16);
  }
  
  /**
   * رمزگذاری متن
   * @param text متن ورودی
   * @returns متن رمزگذاری شده به صورت رشته
   */
  encrypt(text: string): string {
    try {
      // ایجاد رمزکننده
      const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
      
      // رمزگذاری متن
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // ترکیب بردار اولیه و متن رمزگذاری شده
      return this.iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('خطا در رمزگذاری متن:', error);
      throw new Error('خطا در رمزگذاری متن');
    }
  }
  
  /**
   * رمزگشایی متن
   * @param encryptedText متن رمزگذاری شده
   * @returns متن اصلی
   */
  decrypt(encryptedText: string): string {
    try {
      // جداسازی بردار اولیه و متن رمزگذاری شده
      const parts = encryptedText.split(':');
      if (parts.length !== 2) {
        throw new Error('فرمت متن رمزگذاری شده نامعتبر است');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // ایجاد رمزگشا
      const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, iv);
      
      // رمزگشایی متن
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('خطا در رمزگشایی متن:', error);
      throw new Error('خطا در رمزگشایی متن');
    }
  }
  
  /**
   * تولید هش SHA-256
   * @param text متن ورودی
   * @returns هش SHA-256
   */
  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
  
  /**
   * مقایسه متن با هش
   * @param text متن ورودی
   * @param hash هش ذخیره شده
   * @returns نتیجه مقایسه
   */
  compareHash(text: string, hash: string): boolean {
    const textHash = this.hash(text);
    return textHash === hash;
  }
}

export default CryptoService; 