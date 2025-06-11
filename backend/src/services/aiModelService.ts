// backend/src/services/aiModelService.ts
// سرویس مدیریت مدل‌های هوش مصنوعی

import { PrismaClient } from '@prisma/client';
import { AIModelInput, AIModelUpdateInput } from '../types/ai.types';

const prisma = new PrismaClient();

/**
 * سرویس مدیریت مدل‌های هوش مصنوعی
 */
const aiModelService = {
  /**
   * ایجاد مدل جدید
   * @param data اطلاعات مدل جدید
   * @returns مدل ایجاد شده
   */
  async createModel(data: AIModelInput) {
    return prisma.aIModel.create({
      data: {
        providerId: data.providerId,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true,
        capabilities: data.capabilities || [],
        contextSize: data.contextSize || 4000,
        settings: data.settings as any, // اطمینان از وجود فیلد در schema
        priority: data.priority === undefined ? 0 : data.priority, // اضافه کردن فیلد priority با مقدار پیش فرض
      },
    });
  },

  /**
   * دریافت همه مدل‌های یک سرویس‌دهنده
   * @param providerId شناسه سرویس‌دهنده
   * @returns لیست مدل‌ها
   */
  async getProviderModels(providerId: string) {
    return prisma.aIModel.findMany({
      where: { providerId },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * دریافت مدل‌های فعال یک سرویس‌دهنده
   * @param providerId شناسه سرویس‌دهنده
   * @returns لیست مدل‌های فعال
   */
  async getActiveModels(providerId: string) {
    return prisma.aIModel.findMany({
      where: {
        providerId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * دریافت مدل‌های با قابلیت خاص
   * @param capability قابلیت مورد نظر
   * @returns لیست مدل‌های با قابلیت خاص
   */
  async getModelsByCapability(capability: string) {
    return prisma.aIModel.findMany({
      where: {
        isActive: true,
        capabilities: {
          has: capability,
        },
      },
      include: {
        provider: true,
      },
      orderBy: [
        // { provider: { priority: 'desc' } }, // این نوع مرتب سازی مستقیم پشتیبانی نمی شود، فعلا حذف می شود
        { priority: 'desc' }, // مرتب سازی بر اساس اولویت خود مدل
        { name: 'asc' },
      ],
    });
  },

  /**
   * دریافت یک مدل با شناسه
   * @param id شناسه مدل
   * @returns اطلاعات مدل
   */
  async getModelById(id: string) {
    return prisma.aIModel.findUnique({
      where: { id },
      include: {
        provider: true,
      },
    });
  },

  /**
   * به‌روزرسانی مدل
   * @param id شناسه مدل
   * @param data اطلاعات جدید
   * @returns مدل به‌روزرسانی شده
   */
  async updateModel(id: string, data: AIModelUpdateInput) {
    return prisma.aIModel.update({
      where: { id },
      data: {
        displayName: data.displayName,
        description: data.description,
        isActive: data.isActive,
        capabilities: data.capabilities,
        contextSize: data.contextSize,
        settings: data.settings as any, // اطمینان از وجود فیلد در schema
        priority: data.priority,
      },
    });
  },

  /**
   * حذف مدل
   * @param id شناسه مدل
   * @returns نتیجه حذف
   */
  async deleteModel(id: string) {
    return prisma.aIModel.delete({
      where: { id },
    });
  },

  /**
   * دریافت مدل پیش‌فرض یک سرویس‌دهنده
   * @param providerId شناسه سرویس‌دهنده
   * @returns مدل پیش‌فرض
   */
  async getDefaultModelForProvider(providerId: string) {
    // سعی می‌کنیم مدل با قابلیت چت پیدا کنیم
    const chatModel = await prisma.aIModel.findFirst({
      where: {
        providerId,
        isActive: true,
        capabilities: {
          has: 'chat',
        },
      },
      orderBy: { contextSize: 'desc' }, // مدل با بیشترین اندازه متن ورودی
    });
    
    if (chatModel) {
      return chatModel;
    }
    
    // اگر مدل با قابلیت چت پیدا نشد، اولین مدل فعال را برمی‌گردانیم
    return prisma.aIModel.findFirst({
      where: {
        providerId,
        isActive: true,
      },
    });
  },
};

export default aiModelService;