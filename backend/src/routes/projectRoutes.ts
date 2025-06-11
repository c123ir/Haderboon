// backend/src/routes/projectRoutes.ts
// مسیرهای API مربوط به مدیریت پروژه‌ها

import express from 'express';
import { 
  createProject, 
  getAllProjects, 
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// همه مسیرهای این روتر نیاز به احراز هویت دارند
router.use(protect);

// مسیرهای مدیریت پروژه‌ها
router.route('/')
  .post(createProject)      // ایجاد پروژه جدید
  .get(getAllProjects);     // دریافت همه پروژه‌های کاربر

router.route('/:id')
  .get(getProjectById)      // دریافت اطلاعات یک پروژه
  .put(updateProject)       // بروزرسانی اطلاعات یک پروژه
  .delete(deleteProject);   // حذف یک پروژه

export default router; 