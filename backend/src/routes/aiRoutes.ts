// backend/src/routes/aiRoutes.ts
// مسیرهای API مربوط به هوش مصنوعی

import { Router } from 'express';
import { 
  createProvider,
  getAllProviders,
  getActiveProviders,
  getProviderById,
  updateProvider,
  deleteProvider
} from '../controllers/aiProviderController';
import { protect, admin } from '../middleware/authMiddleware';

const router = Router();

// محافظت از تمام مسیرها با میدل‌ور احراز هویت
router.use(protect);

// مسیرهای سرویس‌دهنده‌های هوش مصنوعی
router.route('/providers')
  .get(getAllProviders)          // دریافت همه سرویس‌دهنده‌ها
  .post(admin, createProvider);  // ایجاد سرویس‌دهنده جدید (فقط مدیر)

router.get('/providers/active', getActiveProviders); // دریافت سرویس‌دهنده‌های فعال

router.route('/providers/:id')
  .get(getProviderById)           // دریافت یک سرویس‌دهنده
  .put(admin, updateProvider)     // به‌روزرسانی سرویس‌دهنده (فقط مدیر)
  .delete(admin, deleteProvider); // حذف سرویس‌دهنده (فقط مدیر)

export default router; 