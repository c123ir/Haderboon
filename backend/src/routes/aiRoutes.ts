// مسیر فایل: src/routes/aiRoutes.ts

import express from 'express';
import {
  createProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
} from '../controllers/aiProviderController';
// import {
//   createApiKey, // این توابع به aiApiKeyController منتقل خواهند شد
//   getApiKeys,
//   getApiKeyById,
//   updateApiKey,
//   deleteApiKey,
// } from '../services/aiApiKeyService'; // مسیر به سرویس تغییر می‌کند به کنترلر
import { protect } from '../middleware/authMiddleware';
// import { adminProtect } from '../middleware/adminAuthMiddleware'; // اگر نیاز به دسترسی ادمین باشد

const router = express.Router();

// همه مسیرهای این روتر نیاز به احراز هویت دارند
router.use(protect);

// مسیرهای مدیریت ارائه‌دهندگان AI
// این مسیرها ممکن است نیاز به دسترسی ادمین داشته باشند (adminProtect)
router.route('/providers')
  .get(getProviders) // همه کاربران می‌توانند لیست را ببینند
  .post(createProvider); // TODO: .post(adminProtect, createProvider) - فقط ادمین‌ها می‌توانند ایجاد کنند

router.route('/providers/:id')
  .get(getProviderById) // همه کاربران می‌توانند مشاهده کنند
  .put(updateProvider) // TODO: .put(adminProtect, updateProvider) - فقط ادمین‌ها
  .delete(deleteProvider); // TODO: .delete(adminProtect, deleteProvider) - فقط ادمین‌ها

// مسیرهای مدیریت کلیدهای API (این بخش نیاز به کنترلر جداگانه دارد: aiApiKeyController.ts)
// فعلا کامنت می‌شوند تا کنترلر مربوطه ایجاد شود
/*
router.route('/api-keys')
  .get(getApiKeys) // باید از کنترلر خوانده شود و احتمالا فقط برای کاربر خودش یا ادمین
  .post(createApiKey); // باید از کنترلر خوانده شود

router.route('/api-keys/:id')
  .get(getApiKeyById) // باید از کنترلر خوانده شود
  .put(updateApiKey) // باید از کنترلر خوانده شود
  .delete(deleteApiKey); // باید از کنترلر خوانده شود
*/

// TODO: ایجاد aiApiKeyController.ts و aiModelController.ts و مسیرهای مربوطه

export default router;