// backend/src/services/aiApiKeyService.ts
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
  async createApiKey(data: AIApiKeyInput) {
    // رمزنگاری کلید API قبل از ذخیره‌سازی
    const encryptedKey = encrypt(data.key);
    
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
   * دریافت یک کلید API با شناسه
   * @param id شناسه کلید API
   * @returns اطلاعات کلید API
   */
  async getApiKeyById(id: string) {
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
  async getDecryptedApiKey(id: string) {
    const apiKey = await prisma.aIApiKey.findUnique({
      where: { id },
    });
    
    if (!apiKey) {
      return null;
    }
    
    try {
      // رمزگشایی کلید API
      const decryptedKey = decrypt(apiKey.key);
      return {
        ...apiKey,
        key: decryptedKey,
      };
    } catch (error) {
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
  async updateApiKey(id: string, data: AIApiKeyUpdateInput) {
    const updateData: any = {
      name: data.name,
      isActive: data.isActive,
      expiresAt: data.expiresAt,
    };
    
    // اگر کلید جدید ارائه شده باشد، آن را رمزنگاری می‌کنیم
    if (data.key) {
      updateData.key = encrypt(data.key);
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
  async deleteApiKey(id: string) {
    return prisma.aIApiKey.delete({
      where: { id },
    });
  },

  /**
   * دریافت کلید API فعال برای یک سرویس‌دهنده
   * @param providerId شناسه سرویس‌دهنده
   * @returns کلید API فعال با رمزگشایی
   */
  async getActiveApiKeyForProvider(providerId: string) {
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
      const decryptedKey = decrypt(apiKey.key);
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