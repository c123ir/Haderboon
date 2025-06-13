"use strict";
// backend/src/controllers/aiProviderController.ts
// کنترلر مدیریت سرویس‌دهنده‌های هوش مصنوعی
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProvider = exports.updateProvider = exports.getProviderById = exports.getActiveProviders = exports.getAllProviders = exports.createProvider = void 0;
const aiProviderService_1 = __importDefault(require("../services/aiProviderService"));
/**
 * ایجاد سرویس‌دهنده جدید
 */
const createProvider = async (req, res) => {
    try {
        const provider = await aiProviderService_1.default.createProvider(req.body);
        res.status(201).json({
            success: true,
            data: provider,
            message: 'سرویس‌دهنده هوش مصنوعی با موفقیت ایجاد شد',
        });
    }
    catch (error) {
        console.error('خطا در ایجاد سرویس‌دهنده:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در ایجاد سرویس‌دهنده هوش مصنوعی',
        });
    }
};
exports.createProvider = createProvider;
/**
 * دریافت همه سرویس‌دهنده‌ها
 */
const getAllProviders = async (req, res) => {
    try {
        const providers = await aiProviderService_1.default.getAllProviders();
        res.status(200).json({
            success: true,
            data: providers,
        });
    }
    catch (error) {
        console.error('خطا در دریافت سرویس‌دهنده‌ها:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در دریافت سرویس‌دهنده‌های هوش مصنوعی',
        });
    }
};
exports.getAllProviders = getAllProviders;
/**
 * دریافت سرویس‌دهنده‌های فعال
 */
const getActiveProviders = async (req, res) => {
    try {
        const providers = await aiProviderService_1.default.getActiveProviders();
        res.status(200).json({
            success: true,
            data: providers,
        });
    }
    catch (error) {
        console.error('خطا در دریافت سرویس‌دهنده‌های فعال:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در دریافت سرویس‌دهنده‌های فعال',
        });
    }
};
exports.getActiveProviders = getActiveProviders;
/**
 * دریافت یک سرویس‌دهنده با شناسه
 */
const getProviderById = async (req, res) => {
    try {
        const provider = await aiProviderService_1.default.getProviderById(req.params.id);
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
    }
    catch (error) {
        console.error('خطا در دریافت سرویس‌دهنده:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در دریافت سرویس‌دهنده هوش مصنوعی',
        });
    }
};
exports.getProviderById = getProviderById;
/**
 * به‌روزرسانی سرویس‌دهنده
 */
const updateProvider = async (req, res) => {
    try {
        const updatedProvider = await aiProviderService_1.default.updateProvider(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: updatedProvider,
            message: 'سرویس‌دهنده با موفقیت به‌روزرسانی شد',
        });
    }
    catch (error) {
        console.error('خطا در به‌روزرسانی سرویس‌دهنده:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در به‌روزرسانی سرویس‌دهنده هوش مصنوعی',
        });
    }
};
exports.updateProvider = updateProvider;
/**
 * حذف سرویس‌دهنده
 */
const deleteProvider = async (req, res) => {
    try {
        await aiProviderService_1.default.deleteProvider(req.params.id);
        res.status(200).json({
            success: true,
            message: 'سرویس‌دهنده با موفقیت حذف شد',
        });
    }
    catch (error) {
        console.error('خطا در حذف سرویس‌دهنده:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'خطا در حذف سرویس‌دهنده هوش مصنوعی',
        });
    }
};
exports.deleteProvider = deleteProvider;
