// backend/src/services/aiProviderService.ts
// سرویس مدیریت سرویس‌دهنده‌های هوش مصنوعی

import { PrismaClient } from '@prisma/client';
import { 
  AIProviderInput,
  AIProviderUpdateInput
} from '../types/ai.types';

const prisma = new PrismaClient();

/**
 * سرویس مدیریت سرویس‌دهنده‌های هوش مصنوعی
 */
const aiProviderService = {
  /**
   * ایجاد سرویس‌دهنده جدید
   * @param data اطلاعات سرویس‌دهنده جدید
   * @returns سرویس‌دهنده ایجاد شده
   */
  async createProvider(data: AIProviderInput) {
    return prisma.aIProvider.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description, // اطمینان از وجود فیلد در schema
        // logoUrl: data.logoUrl, // این فیلد در schema.prisma وجود ندارد
        baseUrl: data.baseUrl,
        isActive: data.isActive || false,
        priority: data.priority || 0, // اطمینان از وجود فیلد در schema
        // settings: data.settings as any, // این فیلد در schema.prisma وجود ندارد
      },
    });
  },

  /**
   * دریافت همه سرویس‌دهنده‌ها
   * @returns لیست سرویس‌دهنده‌ها
   */
  async getAllProviders() {
    return prisma.aIProvider.findMany({
      include: {
        _count: {
          select: {
            apiKeys: true,
            models: true,
          },
        },
      },
    });
  },

  /**
   * دریافت سرویس‌دهنده‌های فعال
   * @returns لیست سرویس‌دهنده‌های فعال
   */
  async getActiveProviders() {
    return prisma.aIProvider.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
      include: {
        apiKeys: {
          where: { isActive: true },
        },
        models: {
          where: { isActive: true },
        },
      },
    });
  },

  /**
   * دریافت یک سرویس‌دهنده با شناسه
   * @param id شناسه سرویس‌دهنده
   * @returns اطلاعات سرویس‌دهنده
   */
  async getProviderById(id: string) {
    return prisma.aIProvider.findUnique({
      where: { id },
      include: {
        apiKeys: true,
        models: true,
      },
    });
  },

  /**
   * به‌روزرسانی سرویس‌دهنده
   * @param id شناسه سرویس‌دهنده
   * @param data اطلاعات جدید
   * @returns سرویس‌دهنده به‌روزرسانی شده
   */
  async updateProvider(id: string, data: AIProviderUpdateInput) {
    return prisma.aIProvider.update({
      where: { id },
      data: {
        displayName: data.displayName,
        description: data.description,
        // logoUrl: data.logoUrl, // این فیلد در schema.prisma وجود ندارد
        baseUrl: data.baseUrl,
        isActive: data.isActive,
        priority: data.priority,
        // settings: data.settings as any, // این فیلد در schema.prisma وجود ندارد
      },
    });
  },

  /**
   * حذف سرویس‌دهنده
   * @param id شناسه سرویس‌دهنده
   * @returns نتیجه حذف
   */
  async deleteProvider(id: string) {
    return prisma.aIProvider.delete({
      where: { id },
    });
  },

  /**
   * دریافت سرویس‌دهنده پیش‌فرض (با بالاترین اولویت)
   * @returns سرویس‌دهنده پیش‌فرض
   */
  async getDefaultProvider() {
    return prisma.aIProvider.findFirst({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
      include: {
        apiKeys: {
          where: { isActive: true },
          take: 1,
        },
        models: {
          where: { isActive: true },
        },
      },
    });
  },
};

export default aiProviderService;