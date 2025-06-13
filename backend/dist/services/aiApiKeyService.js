"use strict";
// مسیر فایل: src/services/aiApiKeyService.ts
// سرویس مدیریت کلیدهای API هوش مصنوعی
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client"); // AIApiKey اضافه شد
const encryption_1 = require("../utils/encryption");
// AIApiKeyInput و AIApiKeyUpdateInput از types/ai.types.ts باید باشند
// اگر وجود ندارند باید ایجاد شوند. فعلا از any استفاده می‌کنیم و بعدا اصلاح می‌شود.
// import { AIApiKeyCreateInput, AIApiKeyUpdateInput } from '../types/ai.types'; 
const prisma = new client_1.PrismaClient();
/**
 * سرویس مدیریت کلیدهای API هوش مصنوعی
 */
const aiApiKeyService = {
    /**
     * ایجاد کلید API جدید
     * @param data - اطلاعات کلید API جدید شامل providerId, name, key, userId و اختیاری isActive, expiresAt
     * @returns Promise<AIApiKey> - کلید API ایجاد شده
     */
    async createApiKey(data) {
        // رمزنگاری کلید API قبل از ذخیره‌سازی
        const encryptedKey = (0, encryption_1.encrypt)(data.key);
        return prisma.aIApiKey.create({
            data: {
                providerId: data.providerId,
                name: data.name,
                keyValue: encryptedKey, // نام فیلد در schema.prisma
                isActive: data.isActive !== undefined ? data.isActive : true,
                expiresAt: data.expiresAt,
                userId: data.userId,
            },
        });
    },
    /**
     * دریافت همه کلیدهای API یک کاربر برای یک سرویس‌دهنده خاص
     * @param userId - شناسه کاربر
     * @param providerId - شناسه سرویس‌دهنده (اختیاری)
     * @returns Promise<AIApiKey[]> - لیست کلیدهای API
     */
    async getUserApiKeys(userId, providerId) {
        const whereClause = { userId };
        if (providerId) {
            whereClause.providerId = providerId;
        }
        return prisma.aIApiKey.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true
                    }
                }
            }
        });
    },
    /**
     * دریافت کلید API با شناسه (متعلق به کاربر مشخص)
     * @param id - شناسه کلید API
     * @param userId - شناسه کاربر
     * @returns Promise<AIApiKey | null> - کلید API یا null اگر یافت نشود یا متعلق به کاربر نباشد
     */
    async getApiKeyById(id, userId) {
        return prisma.aIApiKey.findFirst({
            where: { id, userId },
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        displayName: true
                    }
                }
            }
        });
    },
    /**
     * به‌روزرسانی کلید API
     * @param id - شناسه کلید API
     * @param userId - شناسه کاربر (برای بررسی مالکیت)
     * @param data - اطلاعات جدید شامل name, key (اختیاری), isActive, expiresAt
     * @returns Promise<AIApiKey | null> - کلید API به‌روزرسانی شده یا null
     */
    async updateApiKey(id, userId, data) {
        // ابتدا بررسی می‌کنیم که آیا کلید API متعلق به این کاربر است
        const existingApiKey = await prisma.aIApiKey.findFirst({
            where: { id, userId }
        });
        if (!existingApiKey) {
            return null; // یا throw new Error('API Key not found or access denied');
        }
        const updateData = Object.assign({}, data); // کپی از داده‌های ورودی
        // اگر کلید جدید ارائه شده، آن را رمزنگاری کن و فیلد key را حذف کن
        if (data.key) {
            updateData.keyValue = (0, encryption_1.encrypt)(data.key);
            delete updateData.key; // حذف key خام از داده‌های آپدیت
        }
        // حذف فیلدهایی که undefined هستند تا Prisma آنها را آپدیت نکند
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        return prisma.aIApiKey.update({
            where: { id }, // آپدیت بر اساس شناسه کلید
            data: updateData,
        });
    },
    /**
     * حذف کلید API
     * @param id - شناسه کلید API
     * @param userId - شناسه کاربر (برای بررسی مالکیت)
     * @returns Promise<AIApiKey | null> - کلید API حذف شده یا null
     */
    async deleteApiKey(id, userId) {
        // ابتدا بررسی می‌کنیم که آیا کلید API متعلق به این کاربر است
        const existingApiKey = await prisma.aIApiKey.findFirst({
            where: { id, userId }
        });
        if (!existingApiKey) {
            return null; // یا throw new Error('API Key not found or access denied');
        }
        return prisma.aIApiKey.delete({
            where: { id },
        });
    },
    /**
     * دریافت کلید API فعال و رمزگشایی شده برای استفاده توسط یک کاربر خاص
     * @param providerId - شناسه سرویس‌دهنده
     * @param userId - شناسه کاربر
     * @returns Promise<{ key: string } & AIApiKey | null> - کلید API رمزگشایی شده یا null
     */
    async getDecryptedApiKeyForUser(providerId, userId) {
        const now = new Date();
        const apiKey = await prisma.aIApiKey.findFirst({
            where: {
                providerId,
                userId,
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
            orderBy: { createdAt: 'desc' }, // یا بر اساس اولویت اگر فیلدی برای آن دارید
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
            // در این حالت بهتر است خطا را مدیریت کرده و null برگردانیم یا خطا را throw کنیم
            // بسته به نیاز، ممکن است بخواهید یک لاگ دقیق‌تر ثبت کنید
            return null;
        }
    },
};
exports.default = aiApiKeyService;
