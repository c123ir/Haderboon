"use strict";
// backend/src/routes/aiRoutes.ts
// مسیرهای API برای سیستم هوش مصنوعی
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AIController_1 = __importDefault(require("../controllers/AIController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
const aiController = new AIController_1.default();
/**
 * @route   GET /api/ai/providers
 * @desc    دریافت لیست سرویس‌دهنده‌های هوش مصنوعی
 * @access  Private
 */
router.get('/providers', authMiddleware_1.protect, aiController.getProviders);
/**
 * @route   GET /api/ai/api-keys
 * @desc    دریافت لیست کلیدهای API
 * @access  Private (فقط authenticate)
 */
router.get('/api-keys', authMiddleware_1.protect, aiController.getApiKeys);
/**
 * @route   POST /api/ai/api-keys
 * @desc    ایجاد کلید API جدید
 * @access  Private (فقط authenticate)
 */
router.post('/api-keys', authMiddleware_1.protect, aiController.createApiKey);
/**
 * @route   PUT /api/ai/api-keys/:id
 * @desc    به‌روزرسانی کلید API
 * @access  Private (فقط authenticate)
 */
router.put('/api-keys/:id', authMiddleware_1.protect, aiController.updateApiKey);
/**
 * @route   DELETE /api/ai/api-keys/:id
 * @desc    حذف کلید API
 * @access  Private (فقط authenticate)
 */
router.delete('/api-keys/:id', authMiddleware_1.protect, aiController.deleteApiKey);
/**
 * @route   GET /api/ai/providers/:providerId/models
 * @desc    دریافت مدل‌های موجود برای یک سرویس‌دهنده
 * @access  Private (فقط authenticate)
 */
router.get('/providers/:providerId/models', authMiddleware_1.protect, aiController.getAvailableModels);
/**
 * @route   POST /api/ai/chat
 * @desc    ارسال درخواست چت
 * @access  Private
 */
router.post('/chat', authMiddleware_1.protect, aiController.chat);
/**
 * @route   GET /api/ai/sessions
 * @desc    دریافت لیست جلسات چت
 * @access  Private
 */
router.get('/sessions', authMiddleware_1.protect, aiController.getSessions);
/**
 * @route   GET /api/ai/sessions/:sessionId/messages
 * @desc    دریافت پیام‌های یک جلسه
 * @access  Private
 */
router.get('/sessions/:sessionId/messages', authMiddleware_1.protect, aiController.getSessionMessages);
exports.default = router;
