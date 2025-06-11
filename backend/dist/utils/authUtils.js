"use strict";
// backend/src/utils/authUtils.ts
// این فایل شامل توابع کمکی برای احراز هویت و امنیت است
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
// بارگذاری متغیرهای محیطی
dotenv_1.default.config();
// کلید مخفی JWT از متغیرهای محیطی
const JWT_SECRET = process.env.JWT_SECRET || 'haderboon_jwt_secret_key_for_authentication_20240701';
// مدت زمان اعتبار توکن JWT
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
/**
 * هش کردن پسورد کاربر
 * @param password پسورد خام
 * @returns پسورد هش شده
 */
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(10);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
/**
 * مقایسه پسورد ورودی با پسورد هش شده
 * @param password پسورد خام ورودی
 * @param hashedPassword پسورد هش شده ذخیره شده
 * @returns آیا پسورد صحیح است یا خیر
 */
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
/**
 * ایجاد توکن JWT برای کاربر
 * @param userId شناسه کاربر
 * @returns توکن JWT
 */
const generateToken = (userId) => {
    try {
        // استفاده از بدنه try-catch برای گرفتن هرگونه خطای احتمالی
        const payload = { id: userId };
        const options = { expiresIn: JWT_EXPIRES_IN };
        // @ts-ignore - نادیده گرفتن خطای تایپ
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, options);
    }
    catch (error) {
        console.error('خطا در ایجاد توکن JWT:', error);
        return '';
    }
};
exports.generateToken = generateToken;
/**
 * بررسی اعتبار توکن JWT
 * @param token توکن JWT
 * @returns شناسه کاربر استخراج شده از توکن
 */
const verifyToken = (token) => {
    try {
        // @ts-ignore - نادیده گرفتن خطای تایپ
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded.id;
    }
    catch (error) {
        console.error('خطا در تأیید توکن JWT:', error);
        return null;
    }
};
exports.verifyToken = verifyToken;
