// backend/src/routes/documentRoutes.ts
// مسیرهای API مربوط به مستندات در ایجنت هادربون

import { Router } from 'express';
import { 
  createDocument, 
  getProjectDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  createDocumentVersion,
  getDocumentVersion
} from '../controllers/documentController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// محافظت از تمام مسیرها با میدل‌ور احراز هویت
router.use(protect);

// مسیرهای مستندات
router.post('/', createDocument);
router.get('/:id', getDocumentById);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

// مسیرهای نسخه‌های مستندات
router.post('/:id/versions', createDocumentVersion);
router.get('/:id/versions/:versionNumber', getDocumentVersion);

// دریافت مستندات یک پروژه
router.get('/project/:projectId', getProjectDocuments);

export default router; 