"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const projectRoutes_1 = __importDefault(require("./routes/projectRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/documentRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
// بارگذاری متغیرهای محیطی از فایل .env
dotenv_1.default.config();
const app = (0, express_1.default)();
// پورت بک‌اند را از متغیر محیطی یا به صورت پیش‌فرض 5550 تنظیم می‌کنیم
const PORT = process.env.BACKEND_PORT || 5550;
// Middleware برای فعال کردن CORS (اجازه ارتباط فرانت‌اند با بک‌اند)
app.use((0, cors_1.default)());
// Middleware برای پردازش JSON در درخواست‌ها
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
// ثبت مسیرهای API
// مسیرهای احراز هویت (ثبت‌نام و ورود)
app.use('/api/v1/auth', authRoutes_1.default);
// مسیرهای مدیریت پروژه‌ها
app.use('/api/v1/projects', projectRoutes_1.default);
// مسیرهای مدیریت مستندات
app.use('/api/v1/documents', documentRoutes_1.default);
// مسیرهای مدیریت هوش مصنوعی
app.use('/api/v1/ai', aiRoutes_1.default);
// مسیر تست برای اطمینان از عملکرد صحیح سرور
app.get('/', (req, res) => {
    res.json({
        message: 'به API ایجنت هادربون خوش آمدید!',
        version: '1.0.0',
        status: 'در حال توسعه'
    });
});
// مسیر نمایش وضعیت سرور
app.get('/api/v1/status', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'سرور ایجنت هادربون در حال اجرا است',
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        apiVersion: 'v1',
    });
});
// مسیر 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'مسیر مورد نظر یافت نشد'
    });
});
// راه‌اندازی سرور
app.listen(PORT, () => {
    console.log(`سرور بک‌اند ایجنت هادربون بر روی پورت ${PORT} در حال گوش دادن است.`);
    console.log(`http://localhost:${PORT}`);
});
exports.default = app;
