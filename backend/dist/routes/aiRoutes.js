"use strict";
// مسیر فایل: src/routes/aiRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiProviderController_1 = require("../controllers/aiProviderController");
// import {
//   createApiKey, // این توابع به aiApiKeyController منتقل خواهند شد
//   getApiKeys,
//   getApiKeyById,
//   updateApiKey,
//   deleteApiKey,
// } from '../services/aiApiKeyService'; // مسیر به سرویس تغییر می‌کند به کنترلر
const authMiddleware_1 = require("../middleware/authMiddleware");
// import { adminProtect } from '../middleware/adminAuthMiddleware'; // اگر نیاز به دسترسی ادمین باشد
const router = express_1.default.Router();
// همه مسیرهای این روتر نیاز به احراز هویت دارند
router.use(authMiddleware_1.protect);
// مسیرهای مدیریت ارائه‌دهندگان AI
// این مسیرها ممکن است نیاز به دسترسی ادمین داشته باشند (adminProtect)
router.route('/providers')
    .get(aiProviderController_1.getProviders) // همه کاربران می‌توانند لیست را ببینند
    .post(aiProviderController_1.createProvider); // TODO: .post(adminProtect, createProvider) - فقط ادمین‌ها می‌توانند ایجاد کنند
router.route('/providers/:id')
    .get(aiProviderController_1.getProviderById) // همه کاربران می‌توانند مشاهده کنند
    .put(aiProviderController_1.updateProvider) // TODO: .put(adminProtect, updateProvider) - فقط ادمین‌ها
    .delete(aiProviderController_1.deleteProvider); // TODO: .delete(adminProtect, deleteProvider) - فقط ادمین‌ها
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
exports.default = router;
