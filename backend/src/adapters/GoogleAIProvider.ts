// backend/src/adapters/GoogleAIProvider.ts
// Adapter برای سرویس Google AI

import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import BaseAIProvider from './BaseAIProvider';
import { AIChatRequest, AIChatResponse } from '../types/ai.types';

/**
 * Adapter برای سرویس Google AI
 */
class GoogleAIProvider extends BaseAIProvider {
  /**
   * نام سرویس‌دهنده
   */
  readonly name: string = 'google';
  
  /**
   * آدرس پایه API Google AI
   * Google AI از آدرس پایه استفاده نمی‌کند و آدرس‌ها داخل کتابخانه تعریف شده‌اند
   */
  private readonly defaultBaseUrl: string = '';
  
  /**
   * مدل‌های پشتیبانی شده
   */
  private readonly supportedModels = [
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      capabilities: ['chat', 'text'],
      contextSize: 32000
    },
    {
      id: 'gemini-pro-vision',
      name: 'Gemini Pro Vision',
      capabilities: ['chat', 'text', 'vision'],
      contextSize: 16000
    },
    {
      id: 'gemini-ultra',
      name: 'Gemini Ultra',
      capabilities: ['chat', 'text', 'vision', 'code'],
      contextSize: 32000
    },
    {
      id: 'embedding-001',
      name: 'Embedding 001',
      capabilities: ['embedding'],
      contextSize: 2048
    }
  ];
  
  /**
   * سازنده کلاس
   * @param config تنظیمات اختیاری
   */
  constructor(config?: Record<string, any>) {
    super(config);
  }
  
  /**
   * ایجاد نمونه Google AI API با کلید API
   * @param apiKey کلید API
   * @returns نمونه Google AI API
   */
  private createClient(apiKey: string): GoogleGenerativeAI {
    return new GoogleGenerativeAI(apiKey);
  }
  
  /**
   * ایجاد مدل با کلید API
   * @param apiKey کلید API
   * @param modelName نام مدل
   * @returns نمونه مدل
   */
  private createModel(apiKey: string, modelName: string): GenerativeModel {
    const client = this.createClient(apiKey);
    return client.getGenerativeModel({ model: modelName });
  }
  
  /**
   * بررسی اعتبار و دسترسی به API
   * @param apiKey کلید API
   * @returns وضعیت اعتبار کلید
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // ارسال یک درخواست ساده برای بررسی اعتبار کلید
      const model = this.createModel(apiKey, 'gemini-pro');
      await model.generateContent('test');
      return true;
    } catch (error) {
      console.error('خطا در بررسی اعتبار کلید API Google AI:', error);
      return false;
    }
  }
  
  /**
   * دریافت لیست مدل‌های موجود از API
   * @param apiKey کلید API
   * @returns لیست مدل‌ها
   */
  async getAvailableModels(apiKey: string): Promise<Array<{
    id: string;
    name: string;
    capabilities: string[];
    contextSize?: number;
  }>> {
    try {
      // Google AI فعلاً API برای دریافت لیست مدل‌ها ندارد
      // مدل‌های پشتیبانی شده به صورت ثابت تعریف شده‌اند
      return this.supportedModels;
    } catch (error) {
      console.error('خطا در دریافت لیست مدل‌های Google AI:', error);
      throw new Error('خطا در دریافت لیست مدل‌های Google AI');
    }
  }
  
  /**
   * ارسال درخواست چت
   * @param request درخواست چت
   * @param apiKey کلید API
   * @returns پاسخ چت
   */
  async chat(request: AIChatRequest, apiKey: string): Promise<AIChatResponse> {
    try {
      const modelName = request.modelId || 'gemini-pro';
      const model = this.createModel(apiKey, modelName);
      
      // تنظیمات بلاک محتوای مضر
      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ];
      
      // تنظیمات پیش‌فرض
      const generationConfig = {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
        ...request.settings
      };
      
      // سیستم پرامپت
      let chat = model.startChat({
        generationConfig,
        safetySettings,
        history: request.systemPrompt ? [
          { role: 'user', parts: [{ text: 'System: ' + request.systemPrompt }] },
          { role: 'model', parts: [{ text: 'I understand and will follow these instructions.' }] }
        ] : []
      });
      
      // ارسال پیام کاربر
      const result = await chat.sendMessage(request.message);
      const response = result.response;
      
      // محاسبه تعداد تقریبی توکن‌ها
      const promptTokens = this.estimateTokenCount(request.message);
      const responseText = response.text();
      const completionTokens = this.estimateTokenCount(responseText);
      
      return {
        sessionId: request.sessionId || 'temp-session',
        response: responseText,
        model: modelName,
        provider: this.name,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        }
      };
    } catch (error) {
      console.error('خطا در ارسال درخواست چت به Google AI:', error);
      throw new Error('خطا در ارسال درخواست چت به Google AI');
    }
  }
  
  /**
   * ارسال درخواست embeddings (بردار‌های متنی)
   * @param text متن ورودی
   * @param model نام مدل (اختیاری)
   * @param apiKey کلید API
   * @returns بردار‌های متنی
   */
  /**
   * دریافت embedding برای متن
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // دریافت کلید API از تنظیمات
      const apiKey = this.config?.apiKey;
      if (!apiKey) {
        throw new Error('کلید API Google AI تنظیم نشده است');
      }
      
      const client = this.createClient(apiKey);
      const embeddingModel = 'embedding-001';
      
      // استفاده از متد صحیح برای embedding با اضافه کردن role
      const embeddingResult = await client.getGenerativeModel({ model: embeddingModel }).embedContent({
        content: {
          role: 'user',
          parts: [{ text }]
        }
      });
      
      return embeddingResult.embedding.values;
    } catch (error) {
      console.error('خطا در دریافت embedding از Google AI:', error);
      throw new Error('خطا در دریافت embedding از Google AI');
    }
  }
}

export default GoogleAIProvider;