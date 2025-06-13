// backend/src/server.ts

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5550;

// Initialize Prisma Client
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3550', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Haderboon Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Import routes
import authRoutes from './routes/auth';
import projectsRoutes from './routes/projects';

// API Routes
app.use('/api', (req, res, next) => {
  console.log(`📝 API Request: ${req.method} ${req.path} - ${new Date().toLocaleString('fa-IR')}`);
  next();
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);

// Basic API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'سلام از بک‌اند هادربون! 🎉',
    data: {
      projectName: 'Haderboon Backend',
      developer: 'مجتبی حسنی',
      assistant: 'دانیا (Claude)',
      status: 'در حال توسعه',
    }
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ 
      status: 'success',
      message: 'اتصال به پایگاه داده موفقیت‌آمیز بود! ✅',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'خطا در اتصال به پایگاه داده ❌',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'خطای داخلی سرور',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'مسیر یافت نشد',
    path: req.originalUrl,
    method: req.method
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ اتصال به پایگاه داده موفقیت‌آمیز بود');
    
    app.listen(PORT, () => {
      console.log(`🚀 سرور هادربون بر روی پورت ${PORT} راه‌اندازی شد`);
      console.log(`🌐 آدرس: http://localhost:${PORT}`);
      console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
      console.log(`💾 DB Test: http://localhost:${PORT}/api/db-test`);
      console.log('🎯 آماده دریافت درخواست‌ها...');
    });
  } catch (error) {
    console.error('❌ خطا در راه‌اندازی سرور:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 دریافت سیگنال توقف...');
  await prisma.$disconnect();
  console.log('✅ اتصال پایگاه داده بسته شد');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 دریافت سیگنال خاتمه...');
  await prisma.$disconnect();
  console.log('✅ اتصال پایگاه داده بسته شد');
  process.exit(0);
});

startServer();