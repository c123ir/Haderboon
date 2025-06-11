// backend/src/factories/AIProviderFactory.ts
// کلاس Factory برای ساخت Adapter‌های هوش مصنوعی

import { IAIProvider } from '../interfaces/IAIProvider';
import OpenAIProvider from '../adapters/OpenAIProvider';
import GoogleAIProvider from '../adapters/GoogleAIProvider';
import AnthropicProvider from '../adapters/AnthropicProvider';
import OpenRouterProvider from '../adapters/OpenRouterProvider';
import GrokAIProvider from '../adapters/GrokAIProvider';

/**
 * کلاس Factory برای ایجاد نمونه‌های Adapter هوش مصنوعی
 */
class AIProviderFactory {
  /**
   * نام‌های پشتیبانی شده برای سرویس‌دهنده‌ها
   */
  static readonly PROVIDERS = {
    OPENAI: 'openai',
    GOOGLE: 'google',
    ANTHROPIC: 'anthropic',
    OPENROUTER: 'openrouter',
    GROK: 'grok'
  };

  /**
   * نمونه‌های ایجاد شده از Adapter‌ها
   * استفاده از الگوی Singleton برای هر نوع Adapter
   */
  private static instances: Record<string, IAIProvider> = {};

  /**
   * ایجاد Adapter مناسب برای سرویس هوش مصنوعی
   * @param providerName نام سرویس‌دهنده
   * @param config تنظیمات اختیاری
   * @returns نمونه Adapter
   * @throws خطا در صورت نامعتبر بودن نام سرویس‌دهنده
   */
  static createProvider(providerName: string, config?: any): IAIProvider {
    const name = providerName.toLowerCase();

    // بررسی وجود نمونه قبلی (الگوی Singleton)
    if (this.instances[name]) {
      return this.instances[name];
    }

    // ایجاد Adapter مناسب بر اساس نام سرویس‌دهنده
    let provider: IAIProvider;

    switch (name) {
      case this.PROVIDERS.OPENAI:
        provider = new OpenAIProvider(config);
        break;
      case this.PROVIDERS.GOOGLE:
        provider = new GoogleAIProvider(config);
        break;
      case this.PROVIDERS.ANTHROPIC:
        provider = new AnthropicProvider(config);
        break;
      case this.PROVIDERS.OPENROUTER:
        provider = new OpenRouterProvider(config);
        break;
      case this.PROVIDERS.GROK:
        provider = new GrokAIProvider(config);
        break;
      default:
        throw new Error(`سرویس‌دهنده هوش مصنوعی '${providerName}' پشتیبانی نمی‌شود`);
    }

    // ذخیره نمونه برای استفاده‌های بعدی
    this.instances[name] = provider;
    return provider;
  }
  
  /**
   * بررسی پشتیبانی از یک سرویس‌دهنده
   * @param providerName نام سرویس‌دهنده
   * @returns وضعیت پشتیبانی
   */
  static isProviderSupported(providerName: string): boolean {
    const name = providerName.toLowerCase();
    return Object.values(this.PROVIDERS).includes(name);
  }
  
  /**
   * دریافت لیست سرویس‌دهنده‌های پشتیبانی شده
   * @returns لیست نام‌های سرویس‌دهنده‌ها
   */
  static getSupportedProviders(): string[] {
    return Object.values(this.PROVIDERS);
  }
}

export default AIProviderFactory; 