"use strict";
// backend/src/routes/authRoutes.ts
// این فایل شامل مسیرهای مربوط به احراز هویت (ثبت‌نام و ورود) است
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
// ایجاد روتر Express
const router = express_1.default.Router();
/**
 * @route POST /api/v1/auth/register
 * @desc ثبت‌نام کاربر جدید
 * @access عمومی
 */
// تغییر نام‌های route handler:
router.post('/register', authController_1.register);
router.post('/login', authController_1.login);
/**
 * @route GET /api/v1/auth/me
 * @desc دریافت اطلاعات کاربر فعلی
 * @access خصوصی (فقط کاربران احراز هویت شده)
 */
router.get('/me', authMiddleware_1.protect, (req, res) => {
    // از آنجایی که میدل‌ور protect قبلاً اجرا شده، اطلاعات کاربر در req.user موجود است
    const user = req.user;
    res.status(200).json({
        success: true,
        message: 'اطلاعات کاربر فعلی',
        user,
    });
});
exports.default = router;
