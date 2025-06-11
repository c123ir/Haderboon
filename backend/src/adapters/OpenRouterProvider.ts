// backend/src/adapters/OpenRouterProvider.ts
// Adapter برای سرویس OpenRouter

import axios from 'axios';
import BaseAIProvider from './BaseAIProvider';
import { AIChatRequest, AIChatResponse } from '../types/ai.types';

/**
 * Adapter برای سرویس OpenRouter
 */
class OpenRouterProvider extends BaseAIProvider {
  /**
   * نام سرویس‌دهنده
   */
  readonly name: string = 'openrouter';
  
  /**
   * آدرس پایه API OpenRouter
   */
  private readonly defaultBaseUrl: string = 'https://openrouter.ai/api/v1';
  
  /**
   * سازنده کلاس
   * @param config تنظیمات اختیاری
   */
  constructor(config?: Record<string, any>) {
    super(config);
    this.baseUrl = this.config.baseUrl || this.defaultBaseUrl;
  }
  
  /**
   * بررسی اعتبار و دسترسی به API
   * @param apiKey کلید API
   * @returns وضعیت اعتبار کلید
   */
  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      // ارسال درخواست به API برای بررسی اعتبار کلید
      const response = await axios.get(`${this.baseUrl}/auth/key`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('خطا در بررسی اعتبار کلید API OpenRouter:', error);
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
      // دریافت لیست مدل‌ها از API
      const response = await axios.get(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status !== 200 || !response.data.data) {
        throw new Error('خطا در دریافت لیست مدل‌های OpenRouter');
      }
      
      // تبدیل مدل‌های OpenRouter به فرمت استاندارد
      return response.data.data.map((model: any) => {
        // تعیین قابلیت‌های مدل بر اساس نام و توضیحات آن
        const capabilities = ['chat'];
        
        if (model.context_length) {
          // افزودن قابلیت‌های خاص بر اساس نام مدل
          if (model.id.includes('vision') || model.id.includes('gpt-4-vision')) {
            capabilities.push('vision');
          }
          
          if (model.id.includes('claude')) {
            capabilities.push('tool_use');
          }
          
          if (model.id.includes('gpt-4') || model.id.includes('claude-3')) {
            capabilities.push('functions');
            capabilities.push('json');
          }
        }
        
        return {
          id: model.id,
          name: model.name || model.id,
          capabilities,
          contextSize: model.context_length || 4000
        };
      });
    } catch (error) {
      console.error('خطا در دریافت لیست مدل‌های OpenRouter:', error);
      throw new Error('خطا در دریافت لیست مدل‌های OpenRouter');
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
      // آماده‌سازی پیام‌ها
      const messages = [];
      
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
      
      // آماده‌سازی داده‌های درخواست
      const data = {
        model: request.modelId || 'gpt-3.5-turbo',
        messages,
        temperature: settings.temperature,
        max_tokens: settings.max_tokens,
        top_p: settings.top_p,
        frequency_penalty: settings.frequency_penalty,
        presence_penalty: settings.presence_penalty
      };
      
      // ارسال درخواست به API
      const response = await axios.post(`${this.baseUrl}/chat/completions`, data, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://haderboon.com', // نام دامنه پروژه
          'X-Title': 'Haderboon Agent'
        }
      });
      
      // بررسی پاسخ و استخراج داده‌های مورد نیاز
      if (response.status !== 200 || !response.data) {
        throw new Error('خطا در دریافت پاسخ از OpenRouter');
      }
      
      // استخراج پیام دستیار
      const assistantMessage = response.data.choices[0].message.content;
      
      // استخراج اطلاعات استفاده از توکن‌ها
      const usage = response.data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      };
      
      return {
        sessionId: request.sessionId || 'temp-session',
        response: assistantMessage,
        model: request.modelId || 'gpt-3.5-turbo',
        provider: this.name,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        }
      };
    } catch (error) {
      console.error('خطا در ارسال درخواست چت به OpenRouter:', error);
      throw new Error('خطا در ارسال درخواست چت به OpenRouter');
    }
  }
}

export default OpenRouterProvider; 