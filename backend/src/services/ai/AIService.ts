// backend/src/services/ai/AIService.ts
// سرویس اصلی هوش مصنوعی برای استفاده از Adapter‌ها

import { PrismaClient } from '@prisma/client';
import { AIChatRequest, AIChatResponse } from '../../types/ai.types';
import AIProviderFactory from '../../factories/AIProviderFactory';
import CryptoService from '../CryptoService';
import Logger from '../../utils/logger';

/**
 * سرویس اصلی هوش مصنوعی
 * این سرویس مسئول مدیریت و هماهنگی بین ادامه‌های مختلف هوش مصنوعی است
 */
class AIService {
  private prisma: PrismaClient;
  private cryptoService: CryptoService;
  
  /**
   * سازنده کلاس
   * @param prisma نمونه Prisma برای دسترسی به پایگاه داده
   */
  constructor(prisma: PrismaClient, cryptoService: CryptoService) {
    this.prisma = prisma;
    this.cryptoService = cryptoService;
  }
  
  /**
   * دریافت کلید API برای سرویس‌دهنده خاص
   * @param providerId شناسه سرویس‌دهنده
   * @returns کلید API رمزگشایی شده
   */
  private async getApiKey(providerId: string): Promise<string> {
    try {
      // دریافت کلید فعال از پایگاه داده
      const apiKey = await this.prisma.aIApiKey.findFirst({
        where: {
          providerId,
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      if (!apiKey) {
        throw new Error(`هیچ کلید API فعالی برای سرویس ${providerId} یافت نشد`);
      }
      
      // رمزگشایی کلید
      return this.cryptoService.decrypt(apiKey.key);
    } catch (error) {
      Logger.error(`خطا در دریافت کلید API: ${error}`);
      throw new Error('خطا در دریافت کلید API');
    }
  }
  
  /**
   * ارسال درخواست چت
   * @param request درخواست چت
   * @returns پاسخ چت
   */
  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    try {
      // دریافت اطلاعات سرویس‌دهنده
      const providerId = request.providerId || await this.getDefaultProviderId();
      
      // بررسی وجود سرویس‌دهنده
      const provider = await this.prisma.aIProvider.findUnique({
        where: { id: providerId }
      });
      
      if (!provider) {
        throw new Error(`سرویس‌دهنده با شناسه ${providerId} یافت نشد`);
      }
      
      // دریافت کلید API
      const apiKey = await this.getApiKey(provider.id);
      
      // ایجاد Adapter مناسب
      const adapter = AIProviderFactory.createProvider(provider.name);
      
      // ایجاد یا دریافت جلسه
      let sessionId = request.sessionId;
      if (!sessionId) {
        // ایجاد جلسه جدید
        const session = await this.prisma.aISession.create({
          data: {
            title: request.message.substring(0, 50) + '...',
            providerId: provider.id,
            modelId: request.modelId || 'unknown',
            userId: 'system', // در آینده باید از کاربر واقعی استفاده شود
            settings: request.settings || {}
          }
        });
        sessionId = session.id;
      }
      
      // ارسال درخواست به Adapter
      const response = await adapter.chat({
        ...request,
        sessionId
      }, apiKey);
      
      // ذخیره پیام کاربر در پایگاه داده
      await this.prisma.aIMessage.create({
        data: {
          sessionId,
          role: 'user',
          content: request.message
        }
      });
      
      // ذخیره پاسخ در پایگاه داده
      await this.prisma.aIMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content: response.response,
          usage: response.usage
        }
      });
      
      // به‌روزرسانی آمار استفاده
      await this.updateUsageStats(provider.id, request.modelId || 'unknown', response.usage);
      
      return {
        ...response,
        sessionId
      };
    } catch (error) {
      Logger.error(`خطا در ارسال درخواست چت: ${error}`);
      throw new Error('خطا در ارسال درخواست چت');
    }
  }
  
  /**
   * دریافت سرویس‌دهنده پیش‌فرض
   * @returns شناسه سرویس‌دهنده پیش‌فرض
   */
  private async getDefaultProviderId(): Promise<string> {
    try {
      // دریافت سرویس‌دهنده با بالاترین اولویت
      const provider = await this.prisma.aIProvider.findFirst({
        where: { isActive: true },
        orderBy: { priority: 'desc' }
      });
      
      if (!provider) {
        throw new Error('هیچ سرویس‌دهنده فعالی یافت نشد');
      }
      
      return provider.id;
    } catch (error) {
      Logger.error(`خطا در دریافت سرویس‌دهنده پیش‌فرض: ${error}`);
      throw new Error('خطا در دریافت سرویس‌دهنده پیش‌فرض');
    }
  }
  
  /**
   * به‌روزرسانی آمار استفاده
   * @param providerId شناسه سرویس‌دهنده
   * @param modelId شناسه مدل
   * @param usage اطلاعات استفاده
   */
  private async updateUsageStats(providerId: string, modelId: string, usage: any): Promise<void> {
    try {
      // در آینده می‌توان آمار استفاده را در پایگاه داده ذخیره کرد
      // به عنوان مثال: تعداد درخواست‌ها، تعداد توکن‌های مصرف شده، هزینه و ...
    } catch (error) {
      Logger.error(`خطا در به‌روزرسانی آمار استفاده: ${error}`);
      // این خطا نباید باعث شکست کل عملیات شود
    }
  }
  
  /**
   * دریافت لیست سرویس‌دهنده‌های پشتیبانی شده
   * @returns لیست نام‌های سرویس‌دهنده‌ها
   */
  getSupportedProviders(): string[] {
    return AIProviderFactory.getSupportedProviders();
  }
  
  /**
   * دریافت لیست مدل‌های موجود برای سرویس‌دهنده خاص
   * @param providerId شناسه سرویس‌دهنده
   * @returns لیست مدل‌ها
   */
  async getAvailableModels(providerId: string): Promise<any[]> {
    try {
      // دریافت اطلاعات سرویس‌دهنده
      const provider = await this.prisma.aIProvider.findUnique({
        where: { id: providerId }
      });
      
      if (!provider) {
        throw new Error(`سرویس‌دهنده با شناسه ${providerId} یافت نشد`);
      }
      
      // دریافت کلید API
      const apiKey = await this.getApiKey(provider.id);
      
      // ایجاد Adapter مناسب
      const adapter = AIProviderFactory.createProvider(provider.name);
      
      // دریافت لیست مدل‌ها
      return await adapter.getAvailableModels(apiKey);
    } catch (error) {
      Logger.error(`خطا در دریافت لیست مدل‌ها: ${error}`);
      throw new Error('خطا در دریافت لیست مدل‌ها');
    }
  }
  
  /**
   * بررسی اعتبار کلید API
   * @param providerName نام سرویس‌دهنده
   * @param apiKey کلید API
   * @returns وضعیت اعتبار کلید
   */
  async validateApiKey(providerName: string, apiKey: string): Promise<boolean> {
    try {
      // بررسی پشتیبانی از سرویس‌دهنده
      if (!AIProviderFactory.isProviderSupported(providerName)) {
        throw new Error(`سرویس‌دهنده ${providerName} پشتیبانی نمی‌شود`);
      }
      
      // ایجاد Adapter مناسب
      const adapter = AIProviderFactory.createProvider(providerName);
      
      // بررسی اعتبار کلید
      return await adapter.validateApiKey(apiKey);
    } catch (error) {
      Logger.error(`خطا در بررسی اعتبار کلید API: ${error}`);
      return false;
    }
  }
}

export default AIService; 