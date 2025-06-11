import express from 'express';
import {
  createProvider,
  getProviders,
  getProviderById,
  updateProvider,
  deleteProvider,
} from '../controllers/aiProviderController';
import {
  createApiKey,
  getApiKeys,
  getApiKeyById,
  updateApiKey,
  deleteApiKey,
} from '../services/aiApiKeyService';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// همه مسیرهای این روتر نیاز به احراز هویت دارند
router.use(protect);

// مسیرهای مدیریت ارائه‌دهندگان AI
router.route('/providers')
  .get(getProviders)
  .post(createProvider);

router.route('/providers/:id')
  .get(getProviderById)
  .put(updateProvider)
  .delete(deleteProvider);

// مسیرهای مدیریت کلیدهای API
router.route('/api-keys')
  .get(getApiKeys)
  .post(createApiKey);

router.route('/api-keys/:id')
  .get(getApiKeyById)
  .put(updateApiKey)
  .delete(deleteApiKey);

export default router;