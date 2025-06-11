// backend/src/routes/aiRoutes.ts
// مسیرهای API برای سیستم هوش مصنوعی

import express from 'express';
import AIController from '../controllers/AIController';
import { protect as authenticate, admin as authorize } from '../middleware/authMiddleware';
// حذف import authorize چون وجود ندارد

const router = express.Router();
const aiController = new AIController();

/**
 * @route   GET /api/ai/providers
 * @desc    دریافت لیست سرویس‌دهنده‌های هوش مصنوعی
 * @access  Private
 */
router.get('/providers', authenticate, aiController.getProviders);

/**
 * @route   GET /api/ai/api-keys
 * @desc    دریافت لیست کلیدهای API
 * @access  Private (فقط authenticate)
 */
router.get('/api-keys', authenticate, aiController.getApiKeys);

/**
 * @route   POST /api/ai/api-keys
 * @desc    ایجاد کلید API جدید
 * @access  Private (فقط authenticate)
 */
router.post('/api-keys', authenticate, aiController.createApiKey);

/**
 * @route   PUT /api/ai/api-keys/:id
 * @desc    به‌روزرسانی کلید API
 * @access  Private (فقط authenticate)
 */
router.put('/api-keys/:id', authenticate, aiController.updateApiKey);

/**
 * @route   DELETE /api/ai/api-keys/:id
 * @desc    حذف کلید API
 * @access  Private (فقط authenticate)
 */
router.delete('/api-keys/:id', authenticate, aiController.deleteApiKey);

/**
 * @route   GET /api/ai/providers/:providerId/models
 * @desc    دریافت مدل‌های موجود برای یک سرویس‌دهنده
 * @access  Private (فقط authenticate)
 */
router.get('/providers/:providerId/models', authenticate, aiController.getAvailableModels);

/**
 * @route   POST /api/ai/chat
 * @desc    ارسال درخواست چت
 * @access  Private
 */
router.post('/chat', authenticate, aiController.chat);

/**
 * @route   GET /api/ai/sessions
 * @desc    دریافت لیست جلسات چت
 * @access  Private
 */
router.get('/sessions', authenticate, aiController.getSessions);

/**
 * @route   GET /api/ai/sessions/:sessionId/messages
 * @desc    دریافت پیام‌های یک جلسه
 * @access  Private
 */
router.get('/sessions/:sessionId/messages', authenticate, aiController.getSessionMessages);

export default router;