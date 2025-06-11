"use strict";
// مسیر فایل: src/services/aiApiKeyService.ts
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
                keyValue: encryptedKey, // استفاده از keyValue به جای key
                isActive: data.isActive !== undefined ? data.isActive : true,
                expiresAt: data.expiresAt,
                userId: data.userId,
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
     * دریافت کلید API با شناسه
     * @param id شناسه کلید API
     * @returns کلید API
     */
    async getApiKeyById(id) {
        return prisma.aIApiKey.findUnique({
            where: { id },
        });
    },
    /**
     * به‌روزرسانی کلید API
     * @param id شناسه کلید API
     * @param data اطلاعات جدید
     * @returns کلید API به‌روزرسانی شده
     */
    async updateApiKey(id, data) {
        const updateData = Object.assign({}, data);
        // اگر کلید جدید ارائه شده، آن را رمزنگاری کن
        if (data.key) {
            updateData.keyValue = (0, encryption_1.encrypt)(data.key);
            delete updateData.key;
        }
        return prisma.aIApiKey.update({
            where: { id },
            data: updateData,
        });
    },
    /**
     * حذف کلید API
     * @param id شناسه کلید API
     * @returns کلید API حذف شده
     */
    async deleteApiKey(id) {
        return prisma.aIApiKey.delete({
            where: { id },
        });
    },
    /**
     * دریافت کلید API فعال برای استفاده
     * @param providerId شناسه سرویس‌دهنده
     * @returns کلید API رمزگشایی شده
     */
    async getDecryptedApiKey(providerId) {
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
            const decryptedKey = (0, encryption_1.decrypt)(apiKey.keyValue);
            return Object.assign(Object.assign({}, apiKey), { key: decryptedKey });
        }
        catch (error) {
            console.error('خطا در رمزگشایی کلید API:', error);
            return null;
        }
    },
};
exports.default = aiApiKeyService;
