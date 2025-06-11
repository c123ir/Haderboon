"use strict";
// backend/src/services/CryptoService.ts
// سرویس رمزنگاری برای رمزگذاری و رمزگشایی کلیدهای API
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
/**
 * سرویس رمزنگاری برای رمزگذاری و رمزگشایی کلیدهای API
 */
class CryptoService {
    /**
     * سازنده کلاس
     * @param secretKey کلید رمزنگاری (اختیاری)
     */
    constructor(secretKey) {
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
    encrypt(text) {
        try {
            // ایجاد رمزکننده
            const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, this.iv);
            // رمزگذاری متن
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            // ترکیب بردار اولیه و متن رمزگذاری شده
            return this.iv.toString('hex') + ':' + encrypted;
        }
        catch (error) {
            console.error('خطا در رمزگذاری متن:', error);
            throw new Error('خطا در رمزگذاری متن');
        }
    }
    /**
     * رمزگشایی متن
     * @param encryptedText متن رمزگذاری شده
     * @returns متن اصلی
     */
    decrypt(encryptedText) {
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
        }
        catch (error) {
            console.error('خطا در رمزگشایی متن:', error);
            throw new Error('خطا در رمزگشایی متن');
        }
    }
    /**
     * تولید هش SHA-256
     * @param text متن ورودی
     * @returns هش SHA-256
     */
    hash(text) {
        return crypto.createHash('sha256').update(text).digest('hex');
    }
    /**
     * مقایسه متن با هش
     * @param text متن ورودی
     * @param hash هش ذخیره شده
     * @returns نتیجه مقایسه
     */
    compareHash(text, hash) {
        const textHash = this.hash(text);
        return textHash === hash;
    }
}
exports.default = CryptoService;
