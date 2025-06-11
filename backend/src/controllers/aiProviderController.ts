// backend/src/controllers/aiProviderController.ts
// کنترلر مدیریت سرویس‌دهنده‌های هوش مصنوعی

import { Request, Response } from 'express';
import aiProviderService from '../services/aiProviderService';

/**
 * ایجاد سرویس‌دهنده جدید
 */
export const createProvider = async (req: Request, res: Response) => {
  try {
    const provider = await aiProviderService.createProvider(req.body);
    res.status(201).json({
      success: true,
      data: provider,
      message: 'سرویس‌دهنده هوش مصنوعی با موفقیت ایجاد شد',
    });
  } catch (error: any) {
    console.error('خطا در ایجاد سرویس‌دهنده:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در ایجاد سرویس‌دهنده هوش مصنوعی',
    });
  }
};

/**
 * دریافت همه سرویس‌دهنده‌ها
 */
export const getAllProviders = async (req: Request, res: Response) => {
  try {
    const providers = await aiProviderService.getAllProviders();
    res.status(200).json({
      success: true,
      data: providers,
    });
  } catch (error: any) {
    console.error('خطا در دریافت سرویس‌دهنده‌ها:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در دریافت سرویس‌دهنده‌های هوش مصنوعی',
    });
  }
};

/**
 * دریافت سرویس‌دهنده‌های فعال
 */
export const getActiveProviders = async (req: Request, res: Response) => {
  try {
    const providers = await aiProviderService.getActiveProviders();
    res.status(200).json({
      success: true,
      data: providers,
    });
  } catch (error: any) {
    console.error('خطا در دریافت سرویس‌دهنده‌های فعال:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در دریافت سرویس‌دهنده‌های فعال',
    });
  }
};

/**
 * دریافت یک سرویس‌دهنده با شناسه
 */
export const getProviderById = async (req: Request, res: Response) => {
  try {
    const provider = await aiProviderService.getProviderById(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'سرویس‌دهنده مورد نظر یافت نشد',
      });
    }
    
    res.status(200).json({
      success: true,
      data: provider,
    });
  } catch (error: any) {
    console.error('خطا در دریافت سرویس‌دهنده:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در دریافت سرویس‌دهنده هوش مصنوعی',
    });
  }
};

/**
 * به‌روزرسانی سرویس‌دهنده
 */
export const updateProvider = async (req: Request, res: Response) => {
  try {
    const updatedProvider = await aiProviderService.updateProvider(
      req.params.id,
      req.body
    );
    
    res.status(200).json({
      success: true,
      data: updatedProvider,
      message: 'سرویس‌دهنده با موفقیت به‌روزرسانی شد',
    });
  } catch (error: any) {
    console.error('خطا در به‌روزرسانی سرویس‌دهنده:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در به‌روزرسانی سرویس‌دهنده هوش مصنوعی',
    });
  }
};

/**
 * حذف سرویس‌دهنده
 */
export const deleteProvider = async (req: Request, res: Response) => {
  try {
    await aiProviderService.deleteProvider(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'سرویس‌دهنده با موفقیت حذف شد',
    });
  } catch (error: any) {
    console.error('خطا در حذف سرویس‌دهنده:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطا در حذف سرویس‌دهنده هوش مصنوعی',
    });
  }
}; 