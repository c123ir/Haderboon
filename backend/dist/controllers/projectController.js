"use strict";
// مسیر فایل: src/controllers/projectController.ts
// کنترلر مدیریت پروژه‌ها
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProjects = exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getUserProjects = exports.createProject = void 0;
const client_1 = require("@prisma/client"); // UserRole اضافه شد
const prisma = new client_1.PrismaClient();
/**
 * ایجاد پروژه جدید
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const createProject = async (req, res) => {
    var _a;
    try {
        // فیلدهای language و framework از schema.prisma حذف شده‌اند
        const { name, description, repositoryUrl } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است',
            });
        }
        const project = await prisma.project.create({
            data: {
                name,
                description,
                repositoryUrl, // این فیلد در schema.prisma اضافه شده بود
                userId,
            },
        });
        res.status(201).json({
            success: true,
            message: 'پروژه با موفقیت ایجاد شد',
            data: project,
        });
    }
    catch (error) {
        console.error('خطا در ایجاد پروژه:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ایجاد پروژه',
            error: error instanceof Error ? error.message : 'خطای نامشخص',
        });
    }
};
exports.createProject = createProject;
/**
 * دریافت همه پروژه‌های کاربر
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const getUserProjects = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است',
            });
        }
        const projects = await prisma.project.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' }, // استفاده از updatedAt برای مرتب‌سازی جدیدترین‌ها
            include: {
                documents: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' }, // اسناد داخل پروژه هم مرتب شوند
                },
                _count: {
                    select: { documents: true }
                }
            },
        });
        res.json({
            success: true,
            message: 'پروژه‌ها با موفقیت دریافت شدند',
            data: projects,
        });
    }
    catch (error) {
        console.error('خطا در دریافت پروژه‌های کاربر:', error); // تغییر متن خطا
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت پروژه‌های کاربر',
            error: error instanceof Error ? error.message : 'خطای نامشخص',
        });
    }
};
exports.getUserProjects = getUserProjects;
/**
 * دریافت پروژه با شناسه
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const getProjectById = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است',
            });
        }
        const project = await prisma.project.findFirst({
            where: {
                id,
                userId, // اطمینان از اینکه کاربر فقط به پروژه‌های خودش دسترسی دارد
            },
            include: {
                documents: {
                    orderBy: { updatedAt: 'desc' }, // استفاده از updatedAt
                },
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            },
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'پروژه یافت نشد یا شما دسترسی ندارید',
            });
        }
        res.json({
            success: true,
            message: 'پروژه با موفقیت دریافت شد',
            data: project,
        });
    }
    catch (error) {
        console.error('خطا در دریافت پروژه با شناسه:', error); // تغییر متن خطا
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت پروژه با شناسه',
            error: error instanceof Error ? error.message : 'خطای نامشخص',
        });
    }
};
exports.getProjectById = getProjectById;
/**
 * به‌روزرسانی پروژه
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const updateProject = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        // فیلدهای language و framework از schema.prisma حذف شده‌اند
        const { name, description, repositoryUrl, status } = req.body; // status اضافه شد
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است',
            });
        }
        // بررسی وجود پروژه و مالکیت کاربر
        const existingProject = await prisma.project.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'پروژه یافت نشد یا شما دسترسی ندارید',
            });
        }
        const updatedProject = await prisma.project.update({
            where: { id }, // اطمینان از اینکه فقط پروژه متعلق به کاربر آپدیت می‌شود
            data: {
                name,
                description,
                repositoryUrl,
                status, // فیلد status اضافه شد
            },
        });
        res.json({
            success: true,
            message: 'پروژه با موفقیت به‌روزرسانی شد',
            data: updatedProject,
        });
    }
    catch (error) {
        console.error('خطا در به‌روزرسانی پروژه:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در به‌روزرسانی پروژه',
            error: error instanceof Error ? error.message : 'خطای نامشخص',
        });
    }
};
exports.updateProject = updateProject;
/**
 * حذف پروژه
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const deleteProject = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است',
            });
        }
        // بررسی وجود پروژه و مالکیت کاربر
        const existingProject = await prisma.project.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'پروژه یافت نشد یا شما دسترسی ندارید',
            });
        }
        // ابتدا اسناد مرتبط با پروژه حذف شوند (اگر onDelete: Cascade تنظیم نشده باشد)
        // await prisma.document.deleteMany({ where: { projectId: id } });
        // با توجه به اینکه onDelete: Cascade در مدل Project برای documents تنظیم شده، نیازی به این خط نیست
        await prisma.project.delete({
            where: { id }, // اطمینان از اینکه فقط پروژه متعلق به کاربر حذف می‌شود
        });
        res.json({
            success: true,
            message: 'پروژه با موفقیت حذف شد',
        });
    }
    catch (error) {
        console.error('خطا در حذف پروژه:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در حذف پروژه',
            error: error instanceof Error ? error.message : 'خطای نامشخص',
        });
    }
};
exports.deleteProject = deleteProject;
/**
 * دریافت همه پروژه‌ها (فقط برای ادمین)
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const getAllProjects = async (req, res) => {
    try {
        const user = req.user;
        // فقط ادمین‌ها می‌توانند همه پروژه‌ها را ببینند
        if ((user === null || user === void 0 ? void 0 : user.role) !== client_1.UserRole.ADMIN) { // استفاده از UserRole.ADMIN
            return res.status(403).json({ success: false, message: 'دسترسی غیرمجاز' });
        }
        const projects = await prisma.project.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        res.json({
            success: true,
            message: 'همه پروژه‌ها با موفقیت دریافت شدند',
            data: projects,
        });
    }
    catch (error) {
        console.error('خطا در دریافت همه پروژه‌ها:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
    }
};
exports.getAllProjects = getAllProjects;
