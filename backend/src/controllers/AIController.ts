// backend/src/controllers/AIController.ts
// کنترلر برای مدیریت درخواست‌های API هوش مصنوعی

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import AIService from '../services/ai/AIService';
import CryptoService from '../services/CryptoService';
import Logger from '../utils/logger';

/**
 * کنترلر هوش مصنوعی
 */
class AIController {
  private prisma: PrismaClient;
  private aiService: AIService;
  private cryptoService: CryptoService;
  
  /**
   * سازنده کلاس
   */
  constructor() {
    this.prisma = new PrismaClient();
    this.cryptoService = new CryptoService();
    this.aiService = new AIService(this.prisma, this.cryptoService);
  }
  
  /**
   * دریافت لیست سرویس‌دهنده‌ها
   * @param req درخواست
   * @param res پاسخ
   */
  getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
      // دریافت سرویس‌دهنده‌ها از پایگاه داده
      const providers = await this.prisma.aIProvider.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          logoUrl: true,
          baseUrl: true,
          priority: true
        },
        orderBy: { priority: 'desc' }
      });
      
      res.json({
        success: true,
        data: providers
      });
    } catch (error) {
      Logger.error('خطا در دریافت لیست سرویس‌دهنده‌ها:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست سرویس‌دهنده‌ها'
      });
    }
  };
  
  /**
   * دریافت لیست کلیدهای API
   * @param req درخواست
   * @param res پاسخ
   */
  getApiKeys = async (req: Request, res: Response): Promise<void> => {
    try {
      // دریافت کلیدهای API از پایگاه داده
      const apiKeys = await this.prisma.aIApiKey.findMany({
        select: {
          id: true,
          name: true,
          providerId: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true,
          provider: {
            select: {
              name: true,
              displayName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      
      res.json({
        success: true,
        data: apiKeys
      });
    } catch (error) {
      Logger.error('خطا در دریافت لیست کلیدهای API:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست کلیدهای API'
      });
    }
  };
  
  /**
   * ایجاد کلید API جدید
   * @param req درخواست
   * @param res پاسخ
   */
  createApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId, name, key, isActive = true, expiresAt = null } = req.body;
      
      // بررسی اعتبار کلید API
      const provider = await this.prisma.aIProvider.findUnique({
        where: { id: providerId }
      });
      
      if (!provider) {
        res.status(400).json({
          success: false,
          message: 'سرویس‌دهنده یافت نشد'
        });
        return;
      }
      
      // بررسی اعتبار کلید API با سرویس‌دهنده
      const isValid = await this.aiService.validateApiKey(provider.name, key);
      
      if (!isValid) {
        res.status(400).json({
          success: false,
          message: 'کلید API نامعتبر است'
        });
        return;
      }
      
      // رمزگذاری کلید API
      const encryptedKey = this.cryptoService.encrypt(key);
      
      // ذخیره کلید API در پایگاه داده
      const apiKey = await this.prisma.aIApiKey.create({
        data: {
          providerId,
          name,
          key: encryptedKey,
          isActive,
          expiresAt: expiresAt ? new Date(expiresAt) : null
        }
      });
      
      res.status(201).json({
        success: true,
        data: {
          id: apiKey.id,
          name: apiKey.name,
          providerId: apiKey.providerId,
          isActive: apiKey.isActive,
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt
        },
        message: 'کلید API با موفقیت ایجاد شد'
      });
    } catch (error) {
      Logger.error('خطا در ایجاد کلید API:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ایجاد کلید API'
      });
    }
  };
  
  /**
   * به‌روزرسانی کلید API
   * @param req درخواست
   * @param res پاسخ
   */
  updateApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, key, isActive, expiresAt } = req.body;
      
      // بررسی وجود کلید API
      const existingKey = await this.prisma.aIApiKey.findUnique({
        where: { id }
      });
      
      if (!existingKey) {
        res.status(404).json({
          success: false,
          message: 'کلید API یافت نشد'
        });
        return;
      }
      
      // آماده‌سازی داده‌های به‌روزرسانی
      const updateData: any = {};
      
      if (name !== undefined) {
        updateData.name = name;
      }
      
      if (key !== undefined) {
        // بررسی اعتبار کلید جدید
        const provider = await this.prisma.aIProvider.findUnique({
          where: { id: existingKey.providerId }
        });
        
        if (!provider) {
          res.status(400).json({
            success: false,
            message: 'سرویس‌دهنده یافت نشد'
          });
          return;
        }
        
        const isValid = await this.aiService.validateApiKey(provider.name, key);
        
        if (!isValid) {
          res.status(400).json({
            success: false,
            message: 'کلید API نامعتبر است'
          });
          return;
        }
        
        // رمزگذاری کلید جدید
        updateData.key = this.cryptoService.encrypt(key);
      }
      
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }
      
      if (expiresAt !== undefined) {
        updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }
      
      // به‌روزرسانی کلید API
      const updatedKey = await this.prisma.aIApiKey.update({
        where: { id },
        data: updateData
      });
      
      res.json({
        success: true,
        data: {
          id: updatedKey.id,
          name: updatedKey.name,
          providerId: updatedKey.providerId,
          isActive: updatedKey.isActive,
          expiresAt: updatedKey.expiresAt,
          updatedAt: updatedKey.updatedAt
        },
        message: 'کلید API با موفقیت به‌روزرسانی شد'
      });
    } catch (error) {
      Logger.error('خطا در به‌روزرسانی کلید API:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در به‌روزرسانی کلید API'
      });
    }
  };
  
  /**
   * حذف کلید API
   * @param req درخواست
   * @param res پاسخ
   */
  deleteApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      // بررسی وجود کلید API
      const existingKey = await this.prisma.aIApiKey.findUnique({
        where: { id }
      });
      
      if (!existingKey) {
        res.status(404).json({
          success: false,
          message: 'کلید API یافت نشد'
        });
        return;
      }
      
      // حذف کلید API
      await this.prisma.aIApiKey.delete({
        where: { id }
      });
      
      res.json({
        success: true,
        message: 'کلید API با موفقیت حذف شد'
      });
    } catch (error) {
      Logger.error('خطا در حذف کلید API:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در حذف کلید API'
      });
    }
  };
  
  /**
   * دریافت لیست مدل‌ها
   * @param req درخواست
   * @param res پاسخ
   */
  getModels = async (req: Request, res: Response): Promise<void> => {
    try {
      // دریافت مدل‌ها از پایگاه داده
      const models = await this.prisma.aIModel.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          capabilities: true,
          contextSize: true,
          provider: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy: [
          { provider: { priority: 'desc' } },
          { name: 'asc' }
        ]
      });
      
      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      Logger.error('خطا در دریافت لیست مدل‌ها:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت لیست مدل‌ها'
      });
    }
  };
  
  /**
   * دریافت مدل‌های موجود از API سرویس‌دهنده
   * @param req درخواست
   * @param res پاسخ
   */
  getAvailableModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId } = req.params;
      
      // دریافت مدل‌های موجود از API
      const models = await this.aiService.getAvailableModels(providerId);
      
      res.json({
        success: true,
        data: models
      });
    } catch (error) {
      Logger.error('خطا در دریافت مدل‌های موجود:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت مدل‌های موجود'
      });
    }
  };
  
  /**
   * ارسال درخواست چت
   * @param req درخواست
   * @param res پاسخ
   */
  chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { providerId, modelId, message, systemPrompt, sessionId, settings } = req.body;
      
      // ارسال درخواست چت
      const response = await this.aiService.chat({
        providerId,
        modelId,
        message,
        systemPrompt,
        sessionId,
        settings
      });
      
      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      Logger.error('خطا در ارسال درخواست چت:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در ارسال درخواست چت'
      });
    }
  };
  
  /**
   * دریافت جلسات چت
   * @param req درخواست
   * @param res پاسخ
   */
  getSessions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId = null, limit = 20, offset = 0 } = req.query;
      
      // ساخت فیلتر
      const where: any = {};
      if (userId) {
        where.userId = userId as string;
      }
      
      // دریافت جلسات از پایگاه داده
      const sessions = await this.prisma.aISession.findMany({
        where,
        select: {
          id: true,
          title: true,
          userId: true,
          providerId: true,
          modelId: true,
          createdAt: true,
          updatedAt: true,
          provider: {
            select: {
              name: true,
              displayName: true
            }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: Number(limit),
        skip: Number(offset)
      });
      
      // دریافت تعداد کل جلسات
      const total = await this.prisma.aISession.count({ where });
      
      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            ...session,
            messageCount: session._count.messages
          })),
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      Logger.error('خطا در دریافت جلسات چت:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت جلسات چت'
      });
    }
  };
  
  /**
   * دریافت پیام‌های یک جلسه
   * @param req درخواست
   * @param res پاسخ
   */
  getSessionMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      
      // بررسی وجود جلسه
      const session = await this.prisma.aISession.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        res.status(404).json({
          success: false,
          message: 'جلسه یافت نشد'
        });
        return;
      }
      
      // دریافت پیام‌های جلسه
      const messages = await this.prisma.aIMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        take: Number(limit),
        skip: Number(offset)
      });
      
      // دریافت تعداد کل پیام‌ها
      const total = await this.prisma.aIMessage.count({ where: { sessionId } });
      
      res.json({
        success: true,
        data: {
          messages,
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error) {
      Logger.error('خطا در دریافت پیام‌های جلسه:', error);
      res.status(500).json({
        success: false,
        message: 'خطا در دریافت پیام‌های جلسه'
      });
    }
  };
}

export default AIController; 