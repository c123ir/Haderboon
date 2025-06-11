"use strict";
// backend/src/middleware/authMiddleware.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * میدل‌ویر احراز هویت
 * بررسی اعتبار JWT token و اضافه کردن اطلاعات کاربر به request
 */
const protect = async (req, res, next) => {
    try {
        let token;
        // بررسی وجود token در header
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // اگر token وجود نداشت
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'دسترسی غیرمجاز - توکن ارائه نشده است'
            });
            return;
        }
        // تأیید اعتبار token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // یافتن کاربر در پایگاه داده
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                isActive: true
            }
        });
        // بررسی وجود کاربر و فعال بودن آن
        if (!user || !user.isActive) {
            res.status(401).json({
                success: false,
                message: 'کاربر یافت نشد یا غیرفعال است'
            });
            return;
        }
        // اضافه کردن اطلاعات کاربر به request
        req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('خطا در میدل‌ویر احراز هویت:', error);
        res.status(401).json({
            success: false,
            message: 'توکن نامعتبر است'
        });
    }
};
exports.protect = protect;
/**
 * میدل‌ویر بررسی نقش کاربر
 * @param roles - نقش‌های مجاز
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'دسترسی غیرمجاز'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'دسترسی ممنوع - نقش کاربری مناسب نیست'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
