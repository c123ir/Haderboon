"use strict";
// مسیر فایل: src/controllers/authController.ts
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const joi_1 = __importDefault(require("joi"));
const prisma = new client_1.PrismaClient();
/**
 * اسکیمای اعتبارسنجی ثبت‌نام
 */
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    username: joi_1.default.string().min(3).max(30).required(),
    password: joi_1.default.string().min(6).required(),
    firstName: joi_1.default.string().optional(),
    lastName: joi_1.default.string().optional()
});
/**
 * اسکیمای اعتبارسنجی ورود
 */
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
/**
 * ثبت‌نام کاربر جدید
 */
const register = async (req, res) => {
    try {
        // اعتبارسنجی ورودی
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'داده‌های ورودی نامعتبر است',
                error: error.details[0].message
            });
        }
        const { email, username, password, firstName, lastName } = value;
        // بررسی وجود کاربر
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'کاربر با این ایمیل یا نام کاربری قبلاً ثبت‌نام کرده است'
            });
        }
        // هش کردن رمز عبور
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // ایجاد کاربر جدید
        const user = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword,
                firstName,
                lastName
            },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true
            }
        });
        // تولید JWT توکن
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'کاربر با موفقیت ثبت‌نام شد',
            data: {
                user,
                token
            }
        });
    }
    catch (error) {
        console.error('خطا در ثبت‌نام:', error);
        res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور'
        });
    }
};
exports.register = register;
/**
 * ورود کاربر
 */
const login = async (req, res) => {
    try {
        // اعتبارسنجی ورودی
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'داده‌های ورودی نامعتبر است',
                error: error.details[0].message
            });
        }
        const { email, password } = value;
        // یافتن کاربر
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ایمیل یا رمز عبور اشتباه است'
            });
        }
        // بررسی فعال بودن کاربر
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'حساب کاربری غیرفعال است'
            });
        }
        // بررسی رمز عبور
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'ایمیل یا رمز عبور اشتباه است'
            });
        }
        // تولید JWT توکن
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        // حذف رمز عبور از پاسخ
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            success: true,
            message: 'ورود موفقیت‌آمیز',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    }
    catch (error) {
        console.error('خطا در ورود:', error);
        res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور'
        });
    }
};
exports.login = login;
/**
 * دریافت اطلاعات کاربر فعلی
 */
const getProfile = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }
        res.json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        console.error('خطا در دریافت پروفایل:', error);
        res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور'
        });
    }
};
exports.getProfile = getProfile;
/**
 * خروج کاربر (در صورت نیاز به blacklist کردن توکن)
 */
const logout = async (req, res) => {
    try {
        // در حال حاضر فقط پیام موفقیت برمی‌گرداند
        // در آینده می‌توان توکن را به blacklist اضافه کرد
        res.json({
            success: true,
            message: 'خروج موفقیت‌آمیز'
        });
    }
    catch (error) {
        console.error('خطا در خروج:', error);
        res.status(500).json({
            success: false,
            message: 'خطای داخلی سرور'
        });
    }
};
exports.logout = logout;
