import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';

// بارگذاری متغیرهای محیطی از فایل .env
dotenv.config();

const app = express();
// پورت بک‌اند را از متغیر محیطی یا به صورت پیش‌فرض 5550 تنظیم می‌کنیم
const PORT = process.env.BACKEND_PORT || 5550;

// Middleware برای فعال کردن CORS (اجازه ارتباط فرانت‌اند با بک‌اند)
app.use(cors());
// Middleware برای پردازش JSON در درخواست‌ها
app.use(express.json());

// ثبت مسیرهای API
// مسیرهای احراز هویت (ثبت‌نام و ورود)
app.use('/api/v1/auth', authRoutes);
// مسیرهای مدیریت پروژه‌ها
app.use('/api/v1/projects', projectRoutes);

// مسیر تست برای اطمینان از عملکرد صحیح سرور
app.get('/', (req, res) => {
  res.send('ایجنت هادربون بک‌اند در حال اجرا است!');
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

// راه‌اندازی سرور
app.listen(PORT, () => {
  console.log(`سرور بک‌اند ایجنت هادربون بر روی پورت ${PORT} در حال گوش دادن است.`);
  console.log(`http://localhost:${PORT}`);
}); 