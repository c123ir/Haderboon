"use strict";
// backend/src/adapters/GrokAIProvider.ts
// Adapter برای سرویس Grok AI
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const BaseAIProvider_1 = __importDefault(require("./BaseAIProvider"));
/**
 * Adapter برای سرویس Grok AI
 * نکته: در زمان توسعه این کد، Grok API هنوز در دسترس عموم قرار نگرفته است
 * این پیاده‌سازی بر اساس اطلاعات موجود و مشابه سایر API‌ها انجام شده است
 */
class GrokAIProvider extends BaseAIProvider_1.default {
    /**
     * سازنده کلاس
     * @param config تنظیمات اختیاری
     */
    constructor(config) {
        super(config);
        /**
         * نام سرویس‌دهنده
         */
        this.name = 'grok';
        /**
         * آدرس پایه API Grok
         * این آدرس ممکن است با انتشار رسمی API تغییر کند
         */
        this.defaultBaseUrl = 'https://api.grok.x.ai/v1';
        /**
         * مدل‌های پشتیبانی شده
         */
        this.supportedModels = [
            {
                id: 'grok-1',
                name: 'Grok 1',
                capabilities: ['chat', 'search'],
                contextSize: 32000
            },
            {
                id: 'grok-2',
                name: 'Grok 2',
                capabilities: ['chat', 'search', 'vision'],
                contextSize: 128000
            }
        ];
        this.baseUrl = this.config.baseUrl || this.defaultBaseUrl;
    }
    /**
     * بررسی اعتبار و دسترسی به API
     * @param apiKey کلید API
     * @returns وضعیت اعتبار کلید
     */
    async validateApiKey(apiKey) {
        try {
            // ارسال یک درخواست ساده برای بررسی اعتبار کلید
            const response = await axios_1.default.get(`${this.baseUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.status === 200;
        }
        catch (error) {
            console.error('خطا در بررسی اعتبار کلید API Grok:', error);
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
            // به دلیل عدم وجود اطلاعات دقیق در مورد API، از لیست ثابت استفاده می‌کنیم
            // در آینده با انتشار API رسمی، این بخش باید به‌روزرسانی شود
            return this.supportedModels;
        }
        catch (error) {
            console.error('خطا در دریافت لیست مدل‌های Grok:', error);
            throw new Error('خطا در دریافت لیست مدل‌های Grok');
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
            const settings = Object.assign({ temperature: 0.7, max_tokens: 2000, top_p: 1 }, request.settings);
            // آماده‌سازی داده‌های درخواست
            const data = {
                model: request.modelId || 'grok-1',
                messages,
                temperature: settings.temperature,
                max_tokens: settings.max_tokens,
                top_p: settings.top_p,
                use_search: true // فعال‌سازی جستجوی وب در Grok
            };
            // ارسال درخواست به API
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, data, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            // بررسی پاسخ و استخراج داده‌های مورد نیاز
            if (response.status !== 200 || !response.data) {
                throw new Error('خطا در دریافت پاسخ از Grok');
            }
            // استخراج پیام دستیار
            const assistantMessage = response.data.choices[0].message.content;
            // استخراج اطلاعات استفاده از توکن‌ها (در صورت وجود)
            const usage = response.data.usage || {
                prompt_tokens: this.estimateTokenCount(request.message),
                completion_tokens: this.estimateTokenCount(assistantMessage),
                total_tokens: this.estimateTokenCount(request.message) + this.estimateTokenCount(assistantMessage)
            };
            // بررسی اطلاعات جستجوی وب (مختص Grok)
            const webSearchInfo = response.data.search_info || null;
            // اطلاعات جستجوی وب را می‌توان در آینده به خروجی اضافه کرد
            return {
                sessionId: request.sessionId || 'temp-session',
                response: assistantMessage,
                model: request.modelId || 'grok-1',
                provider: this.name,
                usage: {
                    promptTokens: usage.prompt_tokens,
                    completionTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                }
            };
        }
        catch (error) {
            console.error('خطا در ارسال درخواست چت به Grok:', error);
            throw new Error('خطا در ارسال درخواست چت به Grok');
        }
    }
}
exports.default = GrokAIProvider;
