"use strict";
// backend/src/services/ai/AIService.ts
// سرویس اصلی هوش مصنوعی برای استفاده از Adapter‌ها
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AIProviderFactory_1 = __importDefault(require("../../factories/AIProviderFactory"));
const logger_1 = __importDefault(require("../../utils/logger"));
/**
 * سرویس اصلی هوش مصنوعی
 * این سرویس مسئول مدیریت و هماهنگی بین ادامه‌های مختلف هوش مصنوعی است
 */
class AIService {
    /**
     * سازنده کلاس
     * @param prisma نمونه Prisma برای دسترسی به پایگاه داده
     */
    constructor(prisma, cryptoService) {
        this.prisma = prisma;
        this.cryptoService = cryptoService;
    }
    /**
     * دریافت کلید API برای سرویس‌دهنده خاص
     * @param providerId شناسه سرویس‌دهنده
     * @returns کلید API رمزگشایی شده
     */
    async getApiKey(providerId) {
        try {
            // دریافت کلید فعال از پایگاه داده
            const apiKey = await this.prisma.aIApiKey.findFirst({
                where: {
                    providerId,
                    isActive: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            if (!apiKey) {
                throw new Error(`هیچ کلید API فعالی برای سرویس ${providerId} یافت نشد`);
            }
            // رمزگشایی کلید
            return this.cryptoService.decrypt(apiKey.key);
        }
        catch (error) {
            logger_1.default.error(`خطا در دریافت کلید API: ${error}`);
            throw new Error('خطا در دریافت کلید API');
        }
    }
    /**
     * ارسال درخواست چت
     * @param request درخواست چت
     * @returns پاسخ چت
     */
    async chat(request) {
        try {
            // دریافت اطلاعات سرویس‌دهنده
            const providerId = request.providerId || await this.getDefaultProviderId();
            // بررسی وجود سرویس‌دهنده
            const provider = await this.prisma.aIProvider.findUnique({
                where: { id: providerId }
            });
            if (!provider) {
                throw new Error(`سرویس‌دهنده با شناسه ${providerId} یافت نشد`);
            }
            // دریافت کلید API
            const apiKey = await this.getApiKey(provider.id);
            // ایجاد Adapter مناسب
            const adapter = AIProviderFactory_1.default.createProvider(provider.name);
            // ایجاد یا دریافت جلسه
            let sessionId = request.sessionId;
            if (!sessionId) {
                // ایجاد جلسه جدید
                const session = await this.prisma.aISession.create({
                    data: {
                        title: request.message.substring(0, 50) + '...',
                        providerId: provider.id,
                        modelId: request.modelId || 'unknown',
                        userId: 'system', // در آینده باید از کاربر واقعی استفاده شود
                        settings: request.settings || {}
                    }
                });
                sessionId = session.id;
            }
            // ارسال درخواست به Adapter
            const response = await adapter.chat(Object.assign(Object.assign({}, request), { sessionId }), apiKey);
            // ذخیره پیام کاربر در پایگاه داده
            await this.prisma.aIMessage.create({
                data: {
                    sessionId,
                    role: 'user',
                    content: request.message
                }
            });
            // ذخیره پاسخ در پایگاه داده
            await this.prisma.aIMessage.create({
                data: {
                    sessionId,
                    role: 'assistant',
                    content: response.response,
                    usage: response.usage
                }
            });
            // به‌روزرسانی آمار استفاده
            await this.updateUsageStats(provider.id, request.modelId || 'unknown', response.usage);
            return Object.assign(Object.assign({}, response), { sessionId });
        }
        catch (error) {
            logger_1.default.error(`خطا در ارسال درخواست چت: ${error}`);
            throw new Error('خطا در ارسال درخواست چت');
        }
    }
    /**
     * دریافت سرویس‌دهنده پیش‌فرض
     * @returns شناسه سرویس‌دهنده پیش‌فرض
     */
    async getDefaultProviderId() {
        try {
            // دریافت سرویس‌دهنده با بالاترین اولویت
            const provider = await this.prisma.aIProvider.findFirst({
                where: { isActive: true },
                orderBy: { priority: 'desc' }
            });
            if (!provider) {
                throw new Error('هیچ سرویس‌دهنده فعالی یافت نشد');
            }
            return provider.id;
        }
        catch (error) {
            logger_1.default.error(`خطا در دریافت سرویس‌دهنده پیش‌فرض: ${error}`);
            throw new Error('خطا در دریافت سرویس‌دهنده پیش‌فرض');
        }
    }
    /**
     * به‌روزرسانی آمار استفاده
     * @param providerId شناسه سرویس‌دهنده
     * @param modelId شناسه مدل
     * @param usage اطلاعات استفاده
     */
    async updateUsageStats(providerId, modelId, usage) {
        try {
            // در آینده می‌توان آمار استفاده را در پایگاه داده ذخیره کرد
            // به عنوان مثال: تعداد درخواست‌ها، تعداد توکن‌های مصرف شده، هزینه و ...
        }
        catch (error) {
            logger_1.default.error(`خطا در به‌روزرسانی آمار استفاده: ${error}`);
            // این خطا نباید باعث شکست کل عملیات شود
        }
    }
    /**
     * دریافت لیست سرویس‌دهنده‌های پشتیبانی شده
     * @returns لیست نام‌های سرویس‌دهنده‌ها
     */
    getSupportedProviders() {
        return AIProviderFactory_1.default.getSupportedProviders();
    }
    /**
     * دریافت لیست مدل‌های موجود برای سرویس‌دهنده خاص
     * @param providerId شناسه سرویس‌دهنده
     * @returns لیست مدل‌ها
     */
    async getAvailableModels(providerId) {
        try {
            // دریافت اطلاعات سرویس‌دهنده
            const provider = await this.prisma.aIProvider.findUnique({
                where: { id: providerId }
            });
            if (!provider) {
                throw new Error(`سرویس‌دهنده با شناسه ${providerId} یافت نشد`);
            }
            // دریافت کلید API
            const apiKey = await this.getApiKey(provider.id);
            // ایجاد Adapter مناسب
            const adapter = AIProviderFactory_1.default.createProvider(provider.name);
            // دریافت لیست مدل‌ها
            return await adapter.getAvailableModels(apiKey);
        }
        catch (error) {
            logger_1.default.error(`خطا در دریافت لیست مدل‌ها: ${error}`);
            throw new Error('خطا در دریافت لیست مدل‌ها');
        }
    }
    /**
     * بررسی اعتبار کلید API
     * @param providerName نام سرویس‌دهنده
     * @param apiKey کلید API
     * @returns وضعیت اعتبار کلید
     */
    async validateApiKey(providerName, apiKey) {
        try {
            // بررسی پشتیبانی از سرویس‌دهنده
            if (!AIProviderFactory_1.default.isProviderSupported(providerName)) {
                throw new Error(`سرویس‌دهنده ${providerName} پشتیبانی نمی‌شود`);
            }
            // ایجاد Adapter مناسب
            const adapter = AIProviderFactory_1.default.createProvider(providerName);
            // بررسی اعتبار کلید
            return await adapter.validateApiKey(apiKey);
        }
        catch (error) {
            logger_1.default.error(`خطا در بررسی اعتبار کلید API: ${error}`);
            return false;
        }
    }
}
exports.default = AIService;
