"use strict";
// backend/src/controllers/AIController.ts
// کنترلر برای مدیریت درخواست‌های API هوش مصنوعی
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const AIService_1 = __importDefault(require("../services/ai/AIService"));
const CryptoService_1 = __importDefault(require("../services/CryptoService"));
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * کنترلر هوش مصنوعی
 */
class AIController {
    /**
     * سازنده کلاس
     */
    constructor() {
        /**
         * دریافت لیست سرویس‌دهنده‌ها
         * @param req درخواست
         * @param res پاسخ
         */
        this.getProviders = async (req, res) => {
            try {
                // دریافت سرویس‌دهنده‌ها از پایگاه داده
                const providers = await this.prisma.aIProvider.findMany({
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        description: true,
                        logoUrl: true,
                        baseUrl: true,
                        priority: true
                    },
                    orderBy: { priority: 'desc' }
                });
                res.json({
                    success: true,
                    data: providers
                });
            }
            catch (error) {
                logger_1.default.error('خطا در دریافت لیست سرویس‌دهنده‌ها:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در دریافت لیست سرویس‌دهنده‌ها'
                });
            }
        };
        /**
         * دریافت لیست کلیدهای API
         * @param req درخواست
         * @param res پاسخ
         */
        this.getApiKeys = async (req, res) => {
            try {
                // دریافت کلیدهای API از پایگاه داده
                const apiKeys = await this.prisma.aIApiKey.findMany({
                    select: {
                        id: true,
                        name: true,
                        providerId: true,
                        isActive: true,
                        expiresAt: true,
                        createdAt: true,
                        updatedAt: true,
                        provider: {
                            select: {
                                name: true,
                                displayName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                res.json({
                    success: true,
                    data: apiKeys
                });
            }
            catch (error) {
                logger_1.default.error('خطا در دریافت لیست کلیدهای API:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در دریافت لیست کلیدهای API'
                });
            }
        };
        /**
         * ایجاد کلید API جدید
         * @param req درخواست
         * @param res پاسخ
         */
        this.createApiKey = async (req, res) => {
            try {
                const { providerId, name, key, isActive = true, expiresAt = null } = req.body;
                // بررسی اعتبار کلید API
                const provider = await this.prisma.aIProvider.findUnique({
                    where: { id: providerId }
                });
                if (!provider) {
                    res.status(400).json({
                        success: false,
                        message: 'سرویس‌دهنده یافت نشد'
                    });
                    return;
                }
                // بررسی اعتبار کلید API با سرویس‌دهنده
                const isValid = await this.aiService.validateApiKey(provider.name, key);
                if (!isValid) {
                    res.status(400).json({
                        success: false,
                        message: 'کلید API نامعتبر است'
                    });
                    return;
                }
                // رمزگذاری کلید API
                const encryptedKey = this.cryptoService.encrypt(key);
                // ذخیره کلید API در پایگاه داده
                const apiKey = await this.prisma.aIApiKey.create({
                    data: {
                        providerId,
                        name,
                        key: encryptedKey,
                        isActive,
                        expiresAt: expiresAt ? new Date(expiresAt) : null
                    }
                });
                res.status(201).json({
                    success: true,
                    data: {
                        id: apiKey.id,
                        name: apiKey.name,
                        providerId: apiKey.providerId,
                        isActive: apiKey.isActive,
                        expiresAt: apiKey.expiresAt,
                        createdAt: apiKey.createdAt
                    },
                    message: 'کلید API با موفقیت ایجاد شد'
                });
            }
            catch (error) {
                logger_1.default.error('خطا در ایجاد کلید API:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در ایجاد کلید API'
                });
            }
        };
        /**
         * به‌روزرسانی کلید API
         * @param req درخواست
         * @param res پاسخ
         */
        this.updateApiKey = async (req, res) => {
            try {
                const { id } = req.params;
                const { name, key, isActive, expiresAt } = req.body;
                // بررسی وجود کلید API
                const existingKey = await this.prisma.aIApiKey.findUnique({
                    where: { id }
                });
                if (!existingKey) {
                    res.status(404).json({
                        success: false,
                        message: 'کلید API یافت نشد'
                    });
                    return;
                }
                // آماده‌سازی داده‌های به‌روزرسانی
                const updateData = {};
                if (name !== undefined) {
                    updateData.name = name;
                }
                if (key !== undefined) {
                    // بررسی اعتبار کلید جدید
                    const provider = await this.prisma.aIProvider.findUnique({
                        where: { id: existingKey.providerId }
                    });
                    if (!provider) {
                        res.status(400).json({
                            success: false,
                            message: 'سرویس‌دهنده یافت نشد'
                        });
                        return;
                    }
                    const isValid = await this.aiService.validateApiKey(provider.name, key);
                    if (!isValid) {
                        res.status(400).json({
                            success: false,
                            message: 'کلید API نامعتبر است'
                        });
                        return;
                    }
                    // رمزگذاری کلید جدید
                    updateData.key = this.cryptoService.encrypt(key);
                }
                if (isActive !== undefined) {
                    updateData.isActive = isActive;
                }
                if (expiresAt !== undefined) {
                    updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
                }
                // به‌روزرسانی کلید API
                const updatedKey = await this.prisma.aIApiKey.update({
                    where: { id },
                    data: updateData
                });
                res.json({
                    success: true,
                    data: {
                        id: updatedKey.id,
                        name: updatedKey.name,
                        providerId: updatedKey.providerId,
                        isActive: updatedKey.isActive,
                        expiresAt: updatedKey.expiresAt,
                        updatedAt: updatedKey.updatedAt
                    },
                    message: 'کلید API با موفقیت به‌روزرسانی شد'
                });
            }
            catch (error) {
                logger_1.default.error('خطا در به‌روزرسانی کلید API:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در به‌روزرسانی کلید API'
                });
            }
        };
        /**
         * حذف کلید API
         * @param req درخواست
         * @param res پاسخ
         */
        this.deleteApiKey = async (req, res) => {
            try {
                const { id } = req.params;
                // بررسی وجود کلید API
                const existingKey = await this.prisma.aIApiKey.findUnique({
                    where: { id }
                });
                if (!existingKey) {
                    res.status(404).json({
                        success: false,
                        message: 'کلید API یافت نشد'
                    });
                    return;
                }
                // حذف کلید API
                await this.prisma.aIApiKey.delete({
                    where: { id }
                });
                res.json({
                    success: true,
                    message: 'کلید API با موفقیت حذف شد'
                });
            }
            catch (error) {
                logger_1.default.error('خطا در حذف کلید API:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در حذف کلید API'
                });
            }
        };
        /**
         * دریافت لیست مدل‌ها
         * @param req درخواست
         * @param res پاسخ
         */
        this.getModels = async (req, res) => {
            try {
                // دریافت مدل‌ها از پایگاه داده
                const models = await this.prisma.aIModel.findMany({
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        displayName: true,
                        description: true,
                        capabilities: true,
                        contextSize: true,
                        provider: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true
                            }
                        }
                    },
                    orderBy: [
                        { provider: { priority: 'desc' } },
                        { name: 'asc' }
                    ]
                });
                res.json({
                    success: true,
                    data: models
                });
            }
            catch (error) {
                logger_1.default.error('خطا در دریافت لیست مدل‌ها:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در دریافت لیست مدل‌ها'
                });
            }
        };
        /**
         * دریافت مدل‌های موجود از API سرویس‌دهنده
         * @param req درخواست
         * @param res پاسخ
         */
        this.getAvailableModels = async (req, res) => {
            try {
                const { providerId } = req.params;
                // دریافت مدل‌های موجود از API
                const models = await this.aiService.getAvailableModels(providerId);
                res.json({
                    success: true,
                    data: models
                });
            }
            catch (error) {
                logger_1.default.error('خطا در دریافت مدل‌های موجود:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در دریافت مدل‌های موجود'
                });
            }
        };
        /**
         * ارسال درخواست چت
         * @param req درخواست
         * @param res پاسخ
         */
        this.chat = async (req, res) => {
            try {
                const { providerId, modelId, message, systemPrompt, sessionId, settings } = req.body;
                // ارسال درخواست چت
                const response = await this.aiService.chat({
                    providerId,
                    modelId,
                    message,
                    systemPrompt,
                    sessionId,
                    settings
                });
                res.json({
                    success: true,
                    data: response
                });
            }
            catch (error) {
                logger_1.default.error('خطا در ارسال درخواست چت:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در ارسال درخواست چت'
                });
            }
        };
        /**
         * دریافت جلسات چت
         * @param req درخواست
         * @param res پاسخ
         */
        this.getSessions = async (req, res) => {
            try {
                const { userId = null, limit = 20, offset = 0 } = req.query;
                // ساخت فیلتر
                const where = {};
                if (userId) {
                    where.userId = userId;
                }
                // دریافت جلسات از پایگاه داده
                const sessions = await this.prisma.aISession.findMany({
                    where,
                    select: {
                        id: true,
                        title: true,
                        userId: true,
                        providerId: true,
                        modelId: true,
                        createdAt: true,
                        updatedAt: true,
                        provider: {
                            select: {
                                name: true,
                                displayName: true
                            }
                        },
                        _count: {
                            select: { messages: true }
                        }
                    },
                    orderBy: { updatedAt: 'desc' },
                    take: Number(limit),
                    skip: Number(offset)
                });
                // دریافت تعداد کل جلسات
                const total = await this.prisma.aISession.count({ where });
                res.json({
                    success: true,
                    data: {
                        sessions: sessions.map(session => (Object.assign(Object.assign({}, session), { messageCount: session._count.messages }))),
                        total,
                        limit: Number(limit),
                        offset: Number(offset)
                    }
                });
            }
            catch (error) {
                logger_1.default.error('خطا در دریافت جلسات چت:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در دریافت جلسات چت'
                });
            }
        };
        /**
         * دریافت پیام‌های یک جلسه
         * @param req درخواست
         * @param res پاسخ
         */
        this.getSessionMessages = async (req, res) => {
            try {
                const { sessionId } = req.params;
                const { limit = 50, offset = 0 } = req.query;
                // بررسی وجود جلسه
                const session = await this.prisma.aISession.findUnique({
                    where: { id: sessionId }
                });
                if (!session) {
                    res.status(404).json({
                        success: false,
                        message: 'جلسه یافت نشد'
                    });
                    return;
                }
                // دریافت پیام‌های جلسه
                const messages = await this.prisma.aIMessage.findMany({
                    where: { sessionId },
                    orderBy: { createdAt: 'asc' },
                    take: Number(limit),
                    skip: Number(offset)
                });
                // دریافت تعداد کل پیام‌ها
                const total = await this.prisma.aIMessage.count({ where: { sessionId } });
                res.json({
                    success: true,
                    data: {
                        messages,
                        total,
                        limit: Number(limit),
                        offset: Number(offset)
                    }
                });
            }
            catch (error) {
                logger_1.default.error('خطا در دریافت پیام‌های جلسه:', error);
                res.status(500).json({
                    success: false,
                    message: 'خطا در دریافت پیام‌های جلسه'
                });
            }
        };
        this.prisma = new client_1.PrismaClient();
        this.cryptoService = new CryptoService_1.default();
        this.aiService = new AIService_1.default(this.prisma, this.cryptoService);
    }
}
exports.default = AIController;
