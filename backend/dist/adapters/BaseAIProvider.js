"use strict";
// backend/src/adapters/BaseAIProvider.ts
// کلاس پایه برای Adapter‌های هوش مصنوعی
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * کلاس پایه برای تمام Adapter‌های هوش مصنوعی
 * شامل پیاده‌سازی‌های پایه و مشترک
 */
class BaseAIProvider {
    /**
     * سازنده کلاس پایه
     * @param config تنظیمات اختیاری
     */
    constructor(config) {
        this.config = config || {};
        this.baseUrl = this.config.baseUrl || '';
    }
    /**
     * تنظیم آدرس پایه API
     * @param url آدرس پایه
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }
    /**
     * تنظیم یک گزینه در تنظیمات
     * @param key کلید
     * @param value مقدار
     */
    setConfigOption(key, value) {
        this.config[key] = value;
    }
    /**
     * تبدیل پیام‌های یک جلسه به فرمت مناسب برای API
     * @param messages پیام‌های جلسه
     * @returns پیام‌های فرمت‌بندی شده
     */
    formatMessages(messages) {
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
    estimateTokenCount(text) {
        // یک تخمین ساده: هر 4 کاراکتر تقریباً 1 توکن
        return Math.ceil(text.length / 4);
    }
}
exports.default = BaseAIProvider;
