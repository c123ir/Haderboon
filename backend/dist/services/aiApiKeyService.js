"use strict";
// backend/src/services/aiApiKeyService.ts
// سرویس مدیریت کلیدهای API هوش مصنوعی
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const encryption_1 = require("../utils/encryption");
const prisma = new client_1.PrismaClient();
/**
 * سرویس مدیریت کلیدهای API هوش مصنوعی
 */
const aiApiKeyService = {
    /**
     * ایجاد کلید API جدید
     * @param data اطلاعات کلید API جدید
     * @returns کلید API ایجاد شده
     */
    async createApiKey(data) {
        // رمزنگاری کلید API قبل از ذخیره‌سازی
        const encryptedKey = (0, encryption_1.encrypt)(data.key);
        return prisma.aIApiKey.create({
            data: {
                providerId: data.providerId,
                name: data.name,
                key: encryptedKey,
                isActive: data.isActive !== undefined ? data.isActive : true,
                expiresAt: data.expiresAt,
            },
        });
    },
    /**
     * دریافت همه کلیدهای API یک سرویس‌دهنده
     * @param providerId شناسه سرویس‌دهنده
     * @returns لیست کلیدهای API
     */
    async getProviderApiKeys(providerId) {
        return prisma.aIApiKey.findMany({
            where: { providerId },
            orderBy: { createdAt: 'desc' },
        });
    },
    /**
     * دریافت کلیدهای API فعال یک سرویس‌دهنده
     * @param providerId شناسه سرویس‌دهنده
     * @returns لیست کلیدهای API فعال
     */
    async getActiveApiKeys(providerId) {
        const now = new Date();
        return prisma.aIApiKey.findMany({
            where: {
                providerId,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    /**
     * دریافت یک کلید API با شناسه
     * @param id شناسه کلید API
     * @returns اطلاعات کلید API
     */
    async getApiKeyById(id) {
        return prisma.aIApiKey.findUnique({
            where: { id },
            include: {
                provider: true,
            },
        });
    },
    /**
     * دریافت کلید API با رمزگشایی
     * @param id شناسه کلید API
     * @returns کلید API رمزگشایی شده
     */
    async getDecryptedApiKey(id) {
        const apiKey = await prisma.aIApiKey.findUnique({
            where: { id },
        });
        if (!apiKey) {
            return null;
        }
        try {
            // رمزگشایی کلید API
            const decryptedKey = (0, encryption_1.decrypt)(apiKey.key);
            return Object.assign(Object.assign({}, apiKey), { key: decryptedKey });
        }
        catch (error) {
            console.error('خطا در رمزگشایی کلید API:', error);
            throw new Error('خطا در رمزگشایی کلید API');
        }
    },
    /**
     * به‌روزرسانی کلید API
     * @param id شناسه کلید API
     * @param data اطلاعات جدید
     * @returns کلید API به‌روزرسانی شده
     */
    async updateApiKey(id, data) {
        const updateData = {
            name: data.name,
            isActive: data.isActive,
            expiresAt: data.expiresAt,
        };
        // اگر کلید جدید ارائه شده باشد، آن را رمزنگاری می‌کنیم
        if (data.key) {
            updateData.key = (0, encryption_1.encrypt)(data.key);
        }
        return prisma.aIApiKey.update({
            where: { id },
            data: updateData,
        });
    },
    /**
     * حذف کلید API
     * @param id شناسه کلید API
     * @returns نتیجه حذف
     */
    async deleteApiKey(id) {
        return prisma.aIApiKey.delete({
            where: { id },
        });
    },
    /**
     * دریافت کلید API فعال برای یک سرویس‌دهنده
     * @param providerId شناسه سرویس‌دهنده
     * @returns کلید API فعال با رمزگشایی
     */
    async getActiveApiKeyForProvider(providerId) {
        const now = new Date();
        const apiKey = await prisma.aIApiKey.findFirst({
            where: {
                providerId,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!apiKey) {
            return null;
        }
        try {
            // رمزگشایی کلید API
            // تغییر key به keyValue:
            const decryptedKey = (0, encryption_1.decrypt)(apiKey.keyValue); // به جای apiKey.key
            // برای ایجاد API key:
            const apiKey = await prisma.aIApiKey.create({
                data: {
                    name: data.name,
                    keyValue: encryptedKey, // به جای key
                    providerId: data.providerId,
                    userId: data.userId,
                    expiresAt: data.expiresAt || null
                }
            });
            return Object.assign(Object.assign({}, apiKey), { key: decryptedKey });
        }
        catch (error) {
            console.error('خطا در رمزگشایی کلید API:', error);
            return null;
        }
    },
};
exports.default = aiApiKeyService;
