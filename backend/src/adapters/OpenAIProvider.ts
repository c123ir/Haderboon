// backend/src/adapters/OpenAIProvider.ts
// Adapter برای سرویس OpenAI

import { OpenAI } from 'openai';
import BaseAIProvider from './BaseAIProvider';
import { AIChatRequest, AIChatResponse } from '../types/ai.types';
import { ChatCompletionMessageParam } from 'openai/resources';

/**
 * Adapter برای سرویس OpenAI
 */
class OpenAIProvider extends BaseAIProvider {
  /**
   * نام سرویس‌دهنده
   */
  readonly name: string = 'openai';
  
  /**
   * آدرس پایه API OpenAI
   */
  private readonly defaultBaseUrl: string = 'https://api.openai.com/v1';
  
  /**
   * سازنده کلاس
   * @param config تنظیمات اختیاری
   */
  constructor(config?: Record<string, any>) {
    super(config);
    this.baseUrl = this.config.baseUrl || this.defaultBaseUrl;
  }
  
  /**
   * ایجاد نمونه OpenAI API با کلید API
   * @param apiKey کلید API
   * @returns نمونه OpenAI API
   */
  private createClient(apiKey: string): OpenAI {
    return new OpenAI({
      apiKey: apiKey,
      baseURL: this.baseUrl
    });
  }
  
  /**
   * بررسی اعتبار و دسترسی به API
   * @param apiKey کلید API
   * @returns وضعیت اعتبار کلید
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const client = this.createClient(apiKey);
      // دریافت لیست مدل‌ها برای بررسی اعتبار کلید
      await client.models.list();
      return true;
    } catch (error) {
      console.error('خطا در بررسی اعتبار کلید API OpenAI:', error);
      return false;
    }
  }
  
  /**
   * دریافت لیست مدل‌های موجود از API
   * @param apiKey کلید API
   * @returns لیست مدل‌ها
   */
  // تصحیح تابع getAvailableModels:
  async getAvailableModels(apiKey: string): Promise<{
    id: string;
    name: string;
    capabilities: string[];
    contextSize?: number;
  }[]> {
    try {
      const client = this.createClient(apiKey);
      const response = await client.models.list();
      
      // تبدیل مدل‌های OpenAI به فرمت استاندارد
      return response.data.map((model: any) => {
        return { // اضافه کردن return
          id: model.id,
          name: model.id,
          capabilities: ['chat', 'completion'],
          contextSize: this.getModelContextSize(model.id)
        };
      });
    } catch (error) {
      console.error('خطا در دریافت لیست مدل‌های OpenAI:', error);
      throw new Error('خطا در دریافت لیست مدل‌های OpenAI');
    }
  }
  
  // اضافه کردن تابع کمکی:
  private getModelContextSize(modelId: string): number {
    const contextSizes: { [key: string]: number } = {
      'gpt-4': 8192,
      'gpt-4-turbo': 128000,
      'gpt-3.5-turbo': 4096,
      'gpt-3.5-turbo-16k': 16384
    };
    return contextSizes[modelId] || 4096;
  }
  
  /**
   * ارسال درخواست چت
   * @param request درخواست چت
   * @param apiKey کلید API
   * @returns پاسخ چت
   */
  async chat(request: AIChatRequest, apiKey: string): Promise<AIChatResponse> {
    try {
      const client = this.createClient(apiKey);
      
      // آماده‌سازی پیام‌ها
      const messages: ChatCompletionMessageParam[] = [];
      
      // افزودن پیام سیستمی اگر وجود داشته باشد
      if (request.systemPrompt) {
        messages.push({
          role: 'system',
          content: request.systemPrompt
        });
      }
      
      // افزودن پیام کاربر
      messages.push({
        role: 'user',
        content: request.message
      });
      
      // تنظیمات پیش‌فرض
      const settings = {
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        ...request.settings
      };
      
      // ارسال درخواست به API
      const response = await client.chat.completions.create({
        model: request.modelId || 'gpt-3.5-turbo',
        messages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        top_p: settings.topP,
        frequency_penalty: settings.frequencyPenalty,
        presence_penalty: settings.presencePenalty
      });
      
      // آماده‌سازی پاسخ
      const assistantMessage = response.choices[0].message.content || '';
      
      return {
        sessionId: request.sessionId || 'temp-session',
        response: assistantMessage,
        model: request.modelId || 'gpt-3.5-turbo',
        provider: this.name,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('خطا در ارسال درخواست چت به OpenAI:', error);
      throw new Error('خطا در ارسال درخواست چت به OpenAI');
    }
  }
  
  /**
   * ارسال درخواست embeddings (بردار‌های متنی)
   * @param text متن ورودی
   * @param model نام مدل (اختیاری)
   * @param apiKey کلید API
   * @returns بردار‌های متنی
   */
  async getEmbedding(text: string, model?: string, apiKey?: string): Promise<number[]> {
    if (!apiKey) {
      throw new Error('کلید API برای دریافت embedding الزامی است');
    }
    
    try {
      const client = this.createClient(apiKey);
      const embeddingModel = model || 'text-embedding-ada-002';
      
      const response = await client.embeddings.create({
        model: embeddingModel,
        input: text
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('خطا در دریافت embedding از OpenAI:', error);
      throw new Error('خطا در دریافت embedding از OpenAI');
    }
  }
}

export default OpenAIProvider;