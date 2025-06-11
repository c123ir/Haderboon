"use strict";
// backend/src/routes/documentRoutes.ts
// مسیرهای API مربوط به مستندات در ایجنت هادربون
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentController_1 = require("../controllers/documentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// محافظت از تمام مسیرها با میدل‌ور احراز هویت
router.use(authMiddleware_1.protect);
// مسیرهای مستندات
router.post('/', documentController_1.createDocument);
router.get('/:id', documentController_1.getDocumentById);
router.put('/:id', documentController_1.updateDocument);
router.delete('/:id', documentController_1.deleteDocument);
// مسیرهای نسخه‌های مستندات
router.post('/:id/versions', documentController_1.createDocumentVersion);
router.get('/:id/versions/:versionNumber', documentController_1.getDocumentVersion);
// دریافت مستندات یک پروژه
router.get('/project/:projectId', documentController_1.getProjectDocuments);
exports.default = router;
