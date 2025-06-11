// مسیر فایل: src/services/aiApiKeyService.ts
// سرویس مدیریت کلیدهای API هوش مصنوعی

import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt } from '../utils/encryption';
import { AIApiKeyInput, AIApiKeyUpdateInput } from '../types/ai.types';

const prisma = new PrismaClient();

/**
 * سرویس مدیریت کلیدهای API هوش مصنوعی
 */
const aiApiKeyService = {
  /**
   * ایجاد کلید API جدید
   * @param data اطلاعات کلید API جدید
   * @returns کلید API ایجاد شده
   */
  async createApiKey(data: {
    providerId: string;
    name: string;
    key: string;
    isActive?: boolean;
    expiresAt?: Date;
    userId: string;
  }) {
    // رمزنگاری کلید API قبل از ذخیره‌سازی
    const encryptedKey = encrypt(data.key);
    
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
  async getProviderApiKeys(providerId: string) {
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
  async getActiveApiKeys(providerId: string) {
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
  async getApiKeyById(id: string) {
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
  async updateApiKey(id: string, data: AIApiKeyUpdateInput) {
    const updateData: any = { ...data };
    
    // اگر کلید جدید ارائه شده، آن را رمزنگاری کن
    if (data.key) {
      updateData.keyValue = encrypt(data.key);
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
  async deleteApiKey(id: string) {
    return prisma.aIApiKey.delete({
      where: { id },
    });
  },

  /**
   * دریافت کلید API فعال برای استفاده
   * @param providerId شناسه سرویس‌دهنده
   * @returns کلید API رمزگشایی شده
   */
  async getDecryptedApiKey(providerId: string) {
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
      const decryptedKey = decrypt(apiKey.keyValue);
      return {
        ...apiKey,
        key: decryptedKey,
      };
    } catch (error) {
      console.error('خطا در رمزگشایی کلید API:', error);
      return null;
    }
  },
};

export default aiApiKeyService;