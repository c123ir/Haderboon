"use strict";
// مسیر فایل: backend/src/routes/authRoutes.ts
// این فایل شامل مسیرهای مربوط به احراز هویت (ثبت‌نام و ورود) است
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Request حذف شد
const authController_1 = require("../controllers/authController"); // getProfile و logout اضافه شد
const authMiddleware_1 = require("../middleware/authMiddleware");
// ایجاد روتر Express
const router = express_1.default.Router();
/**
 * @route POST /api/v1/auth/register
 * @desc ثبت‌نام کاربر جدید
 * @access عمومی
 */
router.post('/register', authController_1.register);
/**
 * @route POST /api/v1/auth/login
 * @desc ورود کاربر
 * @access عمومی
 */
router.post('/login', authController_1.login);
/**
 * @route GET /api/v1/auth/me
 * @desc دریافت اطلاعات کاربر فعلی
 * @access خصوصی (فقط کاربران احراز هویت شده)
 */
router.get('/me', authMiddleware_1.protect, authController_1.getProfile); // استفاده از getProfile کنترلر
/**
 * @route POST /api/v1/auth/logout
 * @desc خروج کاربر
 * @access خصوصی
 */
router.post('/logout', authMiddleware_1.protect, authController_1.logout); // اضافه کردن مسیر خروج
exports.default = router;
