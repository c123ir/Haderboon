// backend/src/adapters/AnthropicProvider.ts
// Adapter برای سرویس Anthropic (Claude)

import Anthropic from '@anthropic-ai/sdk';
import BaseAIProvider from './BaseAIProvider';
import { AIChatRequest, AIChatResponse } from '../types/ai.types';

/**
 * Adapter برای سرویس Anthropic (Claude)
 */
class AnthropicProvider extends BaseAIProvider {
  /**
   * نام سرویس‌دهنده
   */
  readonly name: string = 'anthropic';
  
  /**
   * آدرس پایه API Anthropic
   */
  private readonly defaultBaseUrl: string = 'https://api.anthropic.com';
  
  /**
   * مدل‌های پشتیبانی شده
   */
  private readonly supportedModels = [
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      capabilities: ['chat', 'vision'],
      contextSize: 200000
    },
    {
      id: 'claude-3-sonnet-20240229',
      name: 'Claude 3 Sonnet',
      capabilities: ['chat', 'vision'],
      contextSize: 200000
    },
    {
      id: 'claude-3-haiku-20240307',
      name: 'Claude 3 Haiku',
      capabilities: ['chat', 'vision'],
      contextSize: 200000
    },
    {
      id: 'claude-2.1',
      name: 'Claude 2.1',
      capabilities: ['chat'],
      contextSize: 100000
    },
    {
      id: 'claude-2.0',
      name: 'Claude 2.0',
      capabilities: ['chat'],
      contextSize: 100000
    },
    {
      id: 'claude-instant-1.2',
      name: 'Claude Instant 1.2',
      capabilities: ['chat'],
      contextSize: 100000
    }
  ];
  
  /**
   * سازنده کلاس
   * @param config تنظیمات اختیاری
   */
  constructor(config?: Record<string, any>) {
    super(config);
    this.baseUrl = this.config.baseUrl || this.defaultBaseUrl;
  }
  
  /**
   * ایجاد نمونه Anthropic API با کلید API
   * @param apiKey کلید API
   * @returns نمونه Anthropic API
   */
  private createClient(apiKey: string): Anthropic {
    return new Anthropic({
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
      // ارسال یک درخواست ساده برای بررسی اعتبار کلید
      const client = this.createClient(apiKey);
      
      // یک درخواست کوچک برای بررسی اعتبار
      await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [
          { role: 'user', content: 'Hello' }
        ]
      });
      
      return true;
    } catch (error) {
      console.error('خطا در بررسی اعتبار کلید API Anthropic:', error);
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
      // Anthropic فعلاً API برای دریافت لیست مدل‌ها ندارد
      // مدل‌های پشتیبانی شده به صورت ثابت تعریف شده‌اند
      return this.supportedModels;
    } catch (error) {
      console.error('خطا در دریافت لیست مدل‌های Anthropic:', error);
      throw new Error('خطا در دریافت لیست مدل‌های Anthropic');
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
      const client = this.createClient(apiKey);
      const modelId = request.modelId || 'claude-3-haiku-20240307';
      
      // آماده‌سازی پیام‌ها
      const messages = [];
      
      // افزودن پیام سیستمی اگر وجود داشته باشد
      if (request.systemPrompt) {
        // برای Claude، پیام سیستمی را به صورت بخشی از پیام کاربر ارسال می‌کنیم
        messages.push({
          role: 'user',
          content: `<system>${request.systemPrompt}</system>\n\n${request.message}`
        });
      } else {
        // افزودن پیام کاربر بدون پیام سیستمی
        messages.push({
          role: 'user',
          content: request.message
        });
      }
      
      // تنظیمات پیش‌فرض
      const settings = {
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 1,
        ...request.settings
      };
      
      // ارسال درخواست به API
      const response = await client.messages.create({
        model: modelId,
        messages: messages,
        max_tokens: settings.max_tokens,
        temperature: settings.temperature,
        top_p: settings.top_p
      });
      
      // آماده‌سازی پاسخ
      let assistantMessage = '';
      
      // بررسی نوع محتوا و استخراج متن
      if (response.content && response.content.length > 0) {
        const content = response.content[0];
        if ('text' in content) {
          assistantMessage = content.text;
        }
      }
      
      // محاسبه تعداد تقریبی توکن‌ها
      const promptTokens = this.estimateTokenCount(request.message) + 
        (request.systemPrompt ? this.estimateTokenCount(request.systemPrompt) : 0);
      const completionTokens = this.estimateTokenCount(assistantMessage);
      
      return {
        sessionId: request.sessionId || 'temp-session',
        response: assistantMessage,
        model: modelId,
        provider: this.name,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens
        }
      };
    } catch (error) {
      console.error('خطا در ارسال درخواست چت به Anthropic:', error);
      throw new Error('خطا در ارسال درخواست چت به Anthropic');
    }
  }
}

export default AnthropicProvider; 