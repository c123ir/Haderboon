"use strict";
// backend/src/factories/AIProviderFactory.ts
// کلاس Factory برای ساخت Adapter‌های هوش مصنوعی
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// مسیر فایل: src/factories/AIProviderFactory.ts
const OpenAIProvider_1 = __importDefault(require("../adapters/OpenAIProvider"));
const GrokAIProvider_1 = __importDefault(require("../adapters/GrokAIProvider"));
const OpenRouterProvider_1 = __importDefault(require("../adapters/OpenRouterProvider"));
// حذف این خطوط:
// import GoogleAIProvider from '../adapters/GoogleAIProvider';
// import AnthropicProvider from '../adapters/AnthropicProvider';
/**
 * کلاس Factory برای ایجاد نمونه‌های Adapter هوش مصنوعی
 */
class AIProviderFactory {
    /**
     * ایجاد Adapter مناسب برای سرویس هوش مصنوعی
     * @param providerName نام سرویس‌دهنده
     * @param config تنظیمات اختیاری
     * @returns نمونه Adapter
     * @throws خطا در صورت نامعتبر بودن نام سرویس‌دهنده
     */
    static createProvider(providerName, config) {
        const name = providerName.toLowerCase();
        // بررسی وجود نمونه قبلی (الگوی Singleton)
        if (this.instances[name]) {
            return this.instances[name];
        }
        // ایجاد Adapter مناسب بر اساس نام سرویس‌دهنده
        let provider;
        switch (name) {
            case this.PROVIDERS.OPENAI:
                provider = new OpenAIProvider_1.default(config);
                break;
            case this.PROVIDERS.GOOGLE:
                provider = new GoogleAIProvider(config);
                break;
            case this.PROVIDERS.ANTHROPIC:
                provider = new AnthropicProvider(config);
                break;
            case this.PROVIDERS.OPENROUTER:
                provider = new OpenRouterProvider_1.default(config);
                break;
            case this.PROVIDERS.GROK:
                provider = new GrokAIProvider_1.default(config);
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
    static isProviderSupported(providerName) {
        const name = providerName.toLowerCase();
        return Object.values(this.PROVIDERS).includes(name);
    }
    /**
     * دریافت لیست سرویس‌دهنده‌های پشتیبانی شده
     * @returns لیست نام‌های سرویس‌دهنده‌ها
     */
    static getSupportedProviders() {
        return Object.values(this.PROVIDERS);
    }
}
/**
 * نام‌های پشتیبانی شده برای سرویس‌دهنده‌ها
 */
AIProviderFactory.PROVIDERS = {
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
AIProviderFactory.instances = {};
exports.default = AIProviderFactory;
