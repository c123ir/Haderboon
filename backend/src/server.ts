// Backend: backend/src/server.ts
// فایل اصلی سرور ایجنت هادربون

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { config } from './config/app';
import { logger } from './config/logger';
import DatabaseService from './config/database';

// Import Routes
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import documentRoutes from './routes/documentRoutes';
import aiRoutes from './routes/aiRoutes';
import chatRoutes from './routes/chatRoutes';

// Import Middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { apiLimiter } from './middleware/rateLimiter';

class Server {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = config.server.port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.server.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    this.app.use(cookieParser());

    // Compression middleware
    this.app.use(compression());

    // Rate limiting
    this.app.use('/api/', apiLimiter);

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.server.environment,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/projects', projectRoutes);
    this.app.use('/api/v1/documents', documentRoutes);
    this.app.use('/api/v1/ai', aiRoutes);
    this.app.use('/api/v1/chat', chatRoutes);

    // API documentation
    this.app.get('/api', (req, res) => {
      res.json({
        message: 'ایجنت هادربون API',
        version: 'v1',
        endpoints: {
          auth: '/api/v1/auth',
          projects: '/api/v1/projects',
          documents: '/api/v1/documents',
          ai: '/api/v1/ai',
          chat: '/api/v1/chat'
        },
        documentation: '/api/docs'
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);
    
    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await DatabaseService.connect();
      
      // Start server
      this.app.listen(this.port, () => {
        logger.info(`🚀 ایجنت هادربون در حال اجرا است`);
        logger.info(`📡 سرور: http://${config.server.host}:${this.port}`);
        logger.info(`🌍 محیط: ${config.server.environment}`);
        logger.info(`📊 Health check: http://${config.server.host}:${this.port}/health`);
      });

      // Graceful shutdown
      process.on('SIGTERM', this.gracefulShutdown);
      process.on('SIGINT', this.gracefulShutdown);

    } catch (error) {
      logger.error('❌ خطا در راه‌اندازی سرور:', error);
      process.exit(1);
    }
  }

  private gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} دریافت شد. شروع خاموش کردن تدریجی...`);
    
    try {
      // Close database connection
      await DatabaseService.disconnect();
      logger.info('✅ اتصال پایگاه داده بسته شد');
      
      process.exit(0);
    } catch (error) {
      logger.error('❌ خطا در خاموش کردن تدریجی:', error);
      process.exit(1);
    }
  };
}

// Start server
const server = new Server();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});