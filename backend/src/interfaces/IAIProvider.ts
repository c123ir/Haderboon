// backend/src/interfaces/IAIProvider.ts
// واسط مشترک برای سرویس‌دهنده‌های هوش مصنوعی

import { AIChatRequest, AIChatResponse } from '../types/ai.types';

/**
 * واسط مشترک برای تمام سرویس‌دهنده‌های هوش مصنوعی
 * هر Adapter باید این واسط را پیاده‌سازی کند
 */
export interface IAIProvider {
  /**
   * نام سرویس‌دهنده
   */
  readonly name: string;
  
  /**
   * بررسی اعتبار و دسترسی به API
   * @param apiKey کلید API
   * @returns وضعیت اعتبار کلید
   */
  validateApiKey(apiKey: string): Promise<boolean>;
  
  /**
   * دریافت لیست مدل‌های موجود از API
   * @param apiKey کلید API
   * @returns لیست مدل‌ها
   */
  getAvailableModels(apiKey: string): Promise<Array<{
    id: string;
    name: string;
    capabilities: string[];
    contextSize?: number;
  }>>;
  
  /**
   * ارسال درخواست چت
   * @param request درخواست چت
   * @param apiKey کلید API
   * @returns پاسخ چت
   */
  chat(request: AIChatRequest, apiKey: string): Promise<AIChatResponse>;
  
  /**
   * ارسال درخواست embeddings (بردار‌های متنی)
   * @param text متن ورودی
   * @param model نام مدل (اختیاری)
   * @param apiKey کلید API
   * @returns بردار‌های متنی
   */
  getEmbedding?(text: string, model?: string, apiKey?: string): Promise<number[]>;
  
  /**
   * دریافت اطلاعات استفاده از API
   * @param apiKey کلید API
   * @returns اطلاعات استفاده
   */
  getUsage?(apiKey: string): Promise<{
    totalTokens?: number;
    totalCost?: number;
    usageByModel?: Record<string, { tokens: number; cost: number }>;
  }>;
} 