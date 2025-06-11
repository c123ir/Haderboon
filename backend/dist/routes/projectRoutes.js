"use strict";
// backend/src/routes/projectRoutes.ts
// مسیرهای API مربوط به مدیریت پروژه‌ها
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const projectController_1 = require("../controllers/projectController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// همه مسیرهای این روتر نیاز به احراز هویت دارند
router.use(authMiddleware_1.protect);
// مسیرهای مدیریت پروژه‌ها
router.route('/')
    .post(projectController_1.createProject) // ایجاد پروژه جدید
    .get(projectController_1.getAllProjects); // دریافت همه پروژه‌های کاربر
router.route('/:id')
    .get(projectController_1.getProjectById) // دریافت اطلاعات یک پروژه
    .put(projectController_1.updateProject) // بروزرسانی اطلاعات یک پروژه
    .delete(projectController_1.deleteProject); // حذف یک پروژه
exports.default = router;
