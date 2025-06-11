// backend/src/routes/aiRoutes.ts
// مسیرهای API برای سیستم هوش مصنوعی

import express from 'express';
import AIController from '../controllers/AIController';
import { protect as authenticate } from '../middleware/authMiddleware';
// حذف import admin چون وجود ندارد
// import { admin as authorize } from '../middleware/authMiddleware';

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
 * @access  Private (Admin)
 */
router.get('/api-keys', authenticate, authorize, aiController.getApiKeys);

/**
 * @route   POST /api/ai/api-keys
 * @desc    ایجاد کلید API جدید
 * @access  Private (Admin)
 */
router.post('/api-keys', authenticate, authorize, aiController.createApiKey);

/**
 * @route   PUT /api/ai/api-keys/:id
 * @desc    به‌روزرسانی کلید API
 * @access  Private (Admin)
 */
router.put('/api-keys/:id', authenticate, authorize, aiController.updateApiKey);

/**
 * @route   DELETE /api/ai/api-keys/:id
 * @desc    حذف کلید API
 * @access  Private (Admin)
 */
router.delete('/api-keys/:id', authenticate, authorize, aiController.deleteApiKey);

/**
 * @route   GET /api/ai/models
 * @desc    دریافت لیست مدل‌های هوش مصنوعی
 * @access  Private
 */
router.get('/models', authenticate, aiController.getModels);

/**
 * @route   GET /api/ai/providers/:providerId/models
 * @desc    دریافت لیست مدل‌های موجود از API سرویس‌دهنده
 * @access  Private (Admin)
 */
router.get('/providers/:providerId/models', authenticate, authorize, aiController.getAvailableModels);

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