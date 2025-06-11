// backend/src/adapters/BaseAIProvider.ts
// کلاس پایه برای Adapter‌های هوش مصنوعی

import { IAIProvider } from '../interfaces/IAIProvider';
import { AIChatRequest, AIChatResponse } from '../types/ai.types';

/**
 * کلاس پایه برای تمام Adapter‌های هوش مصنوعی
 * شامل پیاده‌سازی‌های پایه و مشترک
 */
abstract class BaseAIProvider implements IAIProvider {
  /**
   * نام سرویس‌دهنده
   */
  abstract readonly name: string;
  
  /**
   * تنظیمات پیش‌فرض
   */
  protected config: Record<string, any>;
  
  /**
   * آدرس پایه API
   */
  protected baseUrl: string;
  
  /**
   * سازنده کلاس پایه
   * @param config تنظیمات اختیاری
   */
  constructor(config?: Record<string, any>) {
    this.config = config || {};
    this.baseUrl = this.config.baseUrl || '';
  }
  
  /**
   * تنظیم آدرس پایه API
   * @param url آدرس پایه
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
  
  /**
   * تنظیم یک گزینه در تنظیمات
   * @param key کلید
   * @param value مقدار
   */
  setConfigOption(key: string, value: any): void {
    this.config[key] = value;
  }
  
  /**
   * بررسی اعتبار و دسترسی به API
   * هر Adapter باید این متد را پیاده‌سازی کند
   */
  abstract validateApiKey(apiKey: string): Promise<boolean>;
  
  /**
   * دریافت لیست مدل‌های موجود از API
   * هر Adapter باید این متد را پیاده‌سازی کند
   */
  abstract getAvailableModels(apiKey: string): Promise<Array<{
    id: string;
    name: string;
    capabilities: string[];
    contextSize?: number;
  }>>;
  
  /**
   * ارسال درخواست چت
   * هر Adapter باید این متد را پیاده‌سازی کند
   */
  abstract chat(request: AIChatRequest, apiKey: string): Promise<AIChatResponse>;
  
  /**
   * تبدیل پیام‌های یک جلسه به فرمت مناسب برای API
   * @param messages پیام‌های جلسه
   * @returns پیام‌های فرمت‌بندی شده
   */
  protected formatMessages(messages: Array<{role: string; content: string}>) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }
  
  /**
   * محاسبه تعداد تقریبی توکن‌ها
   * @param text متن
   * @returns تعداد تقریبی توکن‌ها
   */
  protected estimateTokenCount(text: string): number {
    // یک تخمین ساده: هر 4 کاراکتر تقریباً 1 توکن
    return Math.ceil(text.length / 4);
  }
}

export default BaseAIProvider; 