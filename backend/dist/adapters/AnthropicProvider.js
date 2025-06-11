"use strict";
// backend/src/adapters/AnthropicProvider.ts
// Adapter برای سرویس Anthropic (Claude)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const BaseAIProvider_1 = __importDefault(require("./BaseAIProvider"));
/**
 * Adapter برای سرویس Anthropic (Claude)
 */
class AnthropicProvider extends BaseAIProvider_1.default {
    /**
     * سازنده کلاس
     * @param config تنظیمات اختیاری
     */
    constructor(config) {
        super(config);
        /**
         * نام سرویس‌دهنده
         */
        this.name = 'anthropic';
        /**
         * آدرس پایه API Anthropic
         */
        this.defaultBaseUrl = 'https://api.anthropic.com';
        /**
         * مدل‌های پشتیبانی شده
         */
        this.supportedModels = [
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
        this.baseUrl = this.config.baseUrl || this.defaultBaseUrl;
    }
    /**
     * ایجاد نمونه Anthropic API با کلید API
     * @param apiKey کلید API
     * @returns نمونه Anthropic API
     */
    createClient(apiKey) {
        return new sdk_1.default({
            apiKey: apiKey,
            baseURL: this.baseUrl
        });
    }
    /**
     * بررسی اعتبار و دسترسی به API
     * @param apiKey کلید API
     * @returns وضعیت اعتبار کلید
     */
    async validateApiKey(apiKey) {
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
        }
        catch (error) {
            console.error('خطا در بررسی اعتبار کلید API Anthropic:', error);
            return false;
        }
    }
    /**
     * دریافت لیست مدل‌های موجود از API
     * @param apiKey کلید API
     * @returns لیست مدل‌ها
     */
    async getAvailableModels(apiKey) {
        try {
            // Anthropic فعلاً API برای دریافت لیست مدل‌ها ندارد
            // مدل‌های پشتیبانی شده به صورت ثابت تعریف شده‌اند
            return this.supportedModels;
        }
        catch (error) {
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
    async chat(request, apiKey) {
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
            }
            else {
                // افزودن پیام کاربر بدون پیام سیستمی
                messages.push({
                    role: 'user',
                    content: request.message
                });
            }
            // تنظیمات پیش‌فرض
            const settings = Object.assign({ temperature: 0.7, max_tokens: 4000, top_p: 1 }, request.settings);
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
        }
        catch (error) {
            console.error('خطا در ارسال درخواست چت به Anthropic:', error);
            throw new Error('خطا در ارسال درخواست چت به Anthropic');
        }
    }
}
exports.default = AnthropicProvider;
