// Backend: backend/src/server.ts (Simple Version)
// فایل اصلی سرور ساده ایجنت هادربون

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5150;
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3150',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'ایجنت هادربون در حال اجرا است',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'ایجنت هادربون API',
    version: 'v1',
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
      projects: '/api/v1/projects',
      documents: '/api/v1/documents'
    }
  });
});

// Simple users endpoint
app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.json({
      success: true,
      message: 'کاربران با موفقیت دریافت شدند',
      data: users
    });
  } catch (error) {
    console.error('خطا در دریافت کاربران:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت کاربران',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple projects endpoint
app.get('/api/v1/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            documents: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'پروژه‌ها با موفقیت دریافت شدند',
      data: projects
    });
  } catch (error) {
    console.error('خطا در دریافت پروژه‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پروژه‌ها',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simple documents endpoint
app.get('/api/v1/documents', async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      message: 'مستندات با موفقیت دریافت شدند',
      data: documents
    });
  } catch (error) {
    console.error('خطا در دریافت مستندات:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت مستندات',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Database test endpoint
app.get('/api/v1/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    const documentCount = await prisma.document.count();
    
    res.json({
      success: true,
      message: 'اتصال پایگاه داده موفق',
      data: {
        userCount,
        projectCount,
        documentCount,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('خطا در اتصال پایگاه داده:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در اتصال پایگاه داده',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'مسیر یافت نشد',
    path: req.originalUrl
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('خطای سرور:', error);
  
  res.status(500).json({
    success: false,
    message: 'خطای داخلی سرور',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ایجنت هادربون در حال اجرا است`);
  console.log(`📡 سرور: http://localhost:${PORT}`);
  console.log(`🌍 محیط: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 API Info: http://localhost:${PORT}/api`);
  console.log(`👥 Users: http://localhost:${PORT}/api/v1/users`);
  console.log(`📁 Projects: http://localhost:${PORT}/api/v1/projects`);
  console.log(`📝 Documents: http://localhost:${PORT}/api/v1/documents`);
  console.log(`🗄️ DB Test: http://localhost:${PORT}/api/v1/test-db`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM دریافت شد. خاموش کردن تدریجی...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT دریافت شد. خاموش کردن تدریجی...');
  await prisma.$disconnect();
  process.exit(0);
});