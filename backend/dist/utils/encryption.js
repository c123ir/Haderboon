"use strict";
// backend/src/utils/encryption.ts
// سرویس رمزنگاری برای امنیت کلیدهای API
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// کلید رمزنگاری از متغیرهای محیطی یا یک مقدار پیش‌فرض
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'haderboon-default-encryption-key-32char';
// وکتور اولیه (IV) برای رمزنگاری
const IV_LENGTH = 16; // طول IV برای الگوریتم AES-256-CBC
/**
 * رمزنگاری یک رشته
 * @param text متن ورودی برای رمزنگاری
 * @returns متن رمزنگاری شده
 */
const encrypt = (text) => {
    try {
        // ایجاد IV تصادفی
        const iv = crypto_1.default.randomBytes(IV_LENGTH);
        // ایجاد سایفر با الگوریتم AES-256-CBC
        const cipher = crypto_1.default.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        // رمزنگاری متن
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        // ترکیب IV و متن رمزنگاری شده به صورت یک رشته واحد
        return `${iv.toString('hex')}:${encrypted}`;
    }
    catch (error) {
        console.error('خطا در رمزنگاری:', error);
        throw new Error('خطا در رمزنگاری داده');
    }
};
exports.encrypt = encrypt;
/**
 * رمزگشایی یک رشته رمزنگاری شده
 * @param encryptedText متن رمزنگاری شده
 * @returns متن اصلی
 */
const decrypt = (encryptedText) => {
    try {
        // جداسازی IV و متن رمزنگاری شده
        const textParts = encryptedText.split(':');
        if (textParts.length !== 2) {
            throw new Error('فرمت داده رمزنگاری شده نامعتبر است');
        }
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedData = textParts[1];
        // ایجاد دی‌سایفر
        const decipher = crypto_1.default.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        // رمزگشایی متن
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        console.error('خطا در رمزگشایی:', error);
        throw new Error('خطا در رمزگشایی داده');
    }
};
exports.decrypt = decrypt;
