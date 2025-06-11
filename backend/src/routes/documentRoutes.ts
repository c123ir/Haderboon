// backend/src/routes/documentRoutes.ts
// مسیرهای API مربوط به مستندات در ایجنت هادربون

import { Router } from 'express';
import { 
  createDocument, 
  // getProjectDocuments, // این تابع در کنترلر وجود ندارد
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  // createDocumentVersion, // این تابع در کنترلر وجود ندارد
  // getDocumentVersion // این تابع در کنترلر وجود ندارد
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
// router.post('/:id/versions', createDocumentVersion); // این تابع در کنترلر وجود ندارد
// router.get('/:id/versions/:versionNumber', getDocumentVersion); // این تابع در کنترلر وجود ندارد

// دریافت مستندات یک پروژه
// router.get('/project/:projectId', getProjectDocuments); // این تابع در کنترلر وجود ندارد

export default router;