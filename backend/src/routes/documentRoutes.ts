// backend/src/routes/documentRoutes.ts
// مسیرهای API مربوط به مستندات در ایجنت هادربون

import { Router } from 'express';
import { 
  createDocument, 
  getUserDocuments,
  getDocumentById, 
  updateDocument, 
  deleteDocument,
} from '../controllers/documentController';
import {
  createDocumentVersion,
  getDocumentVersions,
  getDocumentVersion,
  deleteDocumentVersion,
} from '../controllers/documentVersionController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// محافظت از تمام مسیرها با میدل‌ور احراز هویت
router.use(protect);

// مسیرهای مستندات
router.post('/', createDocument);
router.get('/', getUserDocuments); // اضافه شد: مسیر برای دریافت تمام اسناد کاربر (می‌تواند با کوئری پارامتر projectId فیلتر شود)
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

// مسیرهای نسخه‌های مستندات
router.post('/:documentId/versions', createDocumentVersion);
router.get('/:documentId/versions', getDocumentVersions);
router.get('/:documentId/versions/:versionNumber', getDocumentVersion);
router.delete('/:documentId/versions/:versionNumber', deleteDocumentVersion);

export default router;