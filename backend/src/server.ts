// Backend: backend/src/server.ts (Corrected for Real Schema)
// فایل اصلی سرور تطبیق یافته با schema واقعی

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
        username: true,
        firstName: true,
        lastName: true,
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
            firstName: true,
            lastName: true,
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
            firstName: true,
            lastName: true,
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

// Get user by ID
app.get('/api/v1/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
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
      message: 'کاربر با موفقیت دریافت شد',
      data: user
    });
  } catch (error) {
    console.error('خطا در دریافت کاربر:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت کاربر',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get project by ID
app.get('/api/v1/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد'
      });
    }

    res.json({
      success: true,
      message: 'پروژه با موفقیت دریافت شد',
      data: project
    });
  } catch (error) {
    console.error('خطا در دریافت پروژه:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پروژه',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get document by ID
app.get('/api/v1/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'مستند یافت نشد'
      });
    }

    res.json({
      success: true,
      message: 'مستند با موفقیت دریافت شد',
      data: document
    });
  } catch (error) {
    console.error('خطا در دریافت مستند:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت مستند',
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
    
    // نمونه کاربر
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    res.json({
      success: true,
      message: 'اتصال پایگاه داده موفق',
      data: {
        counts: {
          users: userCount,
          projects: projectCount,
          documents: documentCount
        },
        sampleUser,
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

// Schema info endpoint
app.get('/api/v1/schema-info', async (req, res) => {
  try {
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    const projectColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'projects'
      ORDER BY ordinal_position
    `;

    res.json({
      success: true,
      message: 'اطلاعات schema',
      data: {
        userColumns,
        projectColumns
      }
    });
  } catch (error) {
    console.error('خطا در دریافت schema:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت اطلاعات schema',
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
  console.log(`📋 Schema Info: http://localhost:${PORT}/api/v1/schema-info`);
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