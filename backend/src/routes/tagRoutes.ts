// backend/src/routes/tagRoutes.ts
// مسیرهای API مربوط به تگ‌های مستندات

import { Router } from 'express';
import {
  createTag,
  getUserTags,
  getTagById,
  updateTag,
  deleteTag,
  assignTagToDocument,
  removeTagFromDocument,
} from '../controllers/tagController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// محافظت از تمام مسیرها با میدل‌ور احراز هویت
router.use(protect);

// مسیرهای اصلی تگ‌ها
router.post('/', createTag);
router.get('/', getUserTags);
router.get('/:id', getTagById);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

// مسیرهای مدیریت رابطه تگ و مستند
router.post('/assign', assignTagToDocument);
router.delete('/documents/:documentId/tags/:tagId', removeTagFromDocument);

export default router; 