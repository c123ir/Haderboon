import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import documentRoutes from './routes/documentRoutes';
import morgan from 'morgan';
import helmet from 'helmet';

// بارگذاری متغیرهای محیطی از فایل .env
dotenv.config();

const app = express();
// پورت بک‌اند را از متغیر محیطی یا به صورت پیش‌فرض 5550 تنظیم می‌کنیم
const PORT = process.env.BACKEND_PORT || 5550;

// Middleware برای فعال کردن CORS (اجازه ارتباط فرانت‌اند با بک‌اند)
app.use(cors());
// Middleware برای پردازش JSON در درخواست‌ها
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(morgan('dev'));

// ثبت مسیرهای API
// مسیرهای احراز هویت (ثبت‌نام و ورود)
app.use('/api/v1/auth', authRoutes);
// مسیرهای مدیریت پروژه‌ها
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/documents', documentRoutes);

// مسیر تست برای اطمینان از عملکرد صحیح سرور
app.get('/', (req: Request, res: Response) => {
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
app.use((req: Request, res: Response) => {
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

export default app; 