"use strict";
// backend/src/controllers/authController.ts
// این فایل شامل کنترلرهای مربوط به احراز هویت (ثبت‌نام و ورود) است
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const authUtils_1 = require("../utils/authUtils");
const prisma_1 = require("../generated/prisma");
// ایجاد نمونه Prisma برای تعامل با پایگاه داده
const prisma = new prisma_1.PrismaClient();
/**
 * کنترلر ثبت‌نام کاربر جدید
 * @route POST /api/v1/auth/register
 */
const registerUser = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        // بررسی وجود همه فیلدهای لازم
        if (!email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'لطفاً تمامی فیلدهای مورد نیاز را وارد کنید',
            });
        }
        // بررسی طول پسورد
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'پسورد باید حداقل 6 کاراکتر باشد',
            });
        }
        // بررسی وجود کاربر با ایمیل یکسان
        const existingUserEmail = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUserEmail) {
            return res.status(409).json({
                success: false,
                message: 'این ایمیل قبلاً ثبت شده است',
            });
        }
        // بررسی وجود کاربر با نام کاربری یکسان
        const existingUserUsername = await prisma.user.findUnique({
            where: { username },
        });
        if (existingUserUsername) {
            return res.status(409).json({
                success: false,
                message: 'این نام کاربری قبلاً ثبت شده است',
            });
        }
        // هش کردن پسورد
        const hashedPassword = await (0, authUtils_1.hashPassword)(password);
        // ایجاد کاربر جدید در پایگاه داده
        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
            },
        });
        // ایجاد توکن JWT
        const token = (0, authUtils_1.generateToken)(newUser.id);
        // ارسال پاسخ موفقیت‌آمیز
        return res.status(201).json({
            success: true,
            message: 'ثبت‌نام با موفقیت انجام شد',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
            },
            token,
        });
    }
    catch (error) {
        console.error('خطا در ثبت‌نام کاربر:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در ثبت‌نام کاربر',
        });
    }
};
exports.registerUser = registerUser;
/**
 * کنترلر ورود کاربر
 * @route POST /api/v1/auth/login
 */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // بررسی وجود همه فیلدهای لازم
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'لطفاً ایمیل و پسورد را وارد کنید',
            });
        }
        // یافتن کاربر با ایمیل وارد شده
        const user = await prisma.user.findUnique({
            where: { email },
        });
        // اگر کاربر پیدا نشد یا پسورد نادرست بود
        if (!user || !(await (0, authUtils_1.comparePassword)(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'ایمیل یا پسورد نادرست است',
            });
        }
        // ایجاد توکن JWT
        const token = (0, authUtils_1.generateToken)(user.id);
        // ارسال پاسخ موفقیت‌آمیز
        return res.status(200).json({
            success: true,
            message: 'ورود با موفقیت انجام شد',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            token,
        });
    }
    catch (error) {
        console.error('خطا در ورود کاربر:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در ورود کاربر',
        });
    }
};
exports.loginUser = loginUser;
