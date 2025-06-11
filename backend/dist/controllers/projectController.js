"use strict";
// backend/src/controllers/projectController.ts
// کنترلر مدیریت پروژه‌ها در ایجنت هادربون
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProjectById = exports.getAllProjects = exports.createProject = void 0;
const prisma_1 = require("../generated/prisma");
// ایجاد نمونه از Prisma Client
const prisma = new prisma_1.PrismaClient();
/**
 * ایجاد پروژه جدید
 * POST /api/v1/projects
 */
const createProject = async (req, res) => {
    var _a;
    try {
        // دریافت اطلاعات پروژه از بدنه درخواست
        const { name, description, path } = req.body;
        // دریافت شناسه کاربر از احراز هویت
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی داده‌های ورودی
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'نام پروژه الزامی است'
            });
        }
        // ایجاد پروژه جدید
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                path,
                ownerId: userId
            }
        });
        return res.status(201).json({
            success: true,
            message: 'پروژه با موفقیت ایجاد شد',
            data: newProject
        });
    }
    catch (error) {
        console.error('خطا در ایجاد پروژه:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در ایجاد پروژه',
            error: error.message
        });
    }
};
exports.createProject = createProject;
/**
 * دریافت همه پروژه‌های کاربر
 * GET /api/v1/projects
 */
const getAllProjects = async (req, res) => {
    var _a;
    try {
        // دریافت شناسه کاربر از احراز هویت
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // دریافت همه پروژه‌های متعلق به کاربر
        const projects = await prisma.project.findMany({
            where: {
                ownerId: userId
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        return res.status(200).json({
            success: true,
            message: 'پروژه‌ها با موفقیت دریافت شدند',
            data: projects
        });
    }
    catch (error) {
        console.error('خطا در دریافت پروژه‌ها:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در دریافت پروژه‌ها',
            error: error.message
        });
    }
};
exports.getAllProjects = getAllProjects;
/**
 * دریافت اطلاعات یک پروژه با شناسه
 * GET /api/v1/projects/:id
 */
const getProjectById = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // دریافت پروژه با شناسه
        const project = await prisma.project.findUnique({
            where: {
                id
            }
        });
        // بررسی وجود پروژه
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'پروژه یافت نشد'
            });
        }
        // بررسی مجوز دسترسی (فقط مالک پروژه)
        if (project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز دسترسی به این پروژه را ندارید'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'پروژه با موفقیت دریافت شد',
            data: project
        });
    }
    catch (error) {
        console.error('خطا در دریافت پروژه:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در دریافت پروژه',
            error: error.message
        });
    }
};
exports.getProjectById = getProjectById;
/**
 * بروزرسانی اطلاعات یک پروژه
 * PUT /api/v1/projects/:id
 */
const updateProject = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { name, description, path } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی وجود پروژه و دسترسی کاربر
        const existingProject = await prisma.project.findUnique({
            where: {
                id
            }
        });
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'پروژه یافت نشد'
            });
        }
        if (existingProject.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز ویرایش این پروژه را ندارید'
            });
        }
        // بروزرسانی پروژه
        const updatedProject = await prisma.project.update({
            where: {
                id
            },
            data: {
                name,
                description,
                path
            }
        });
        return res.status(200).json({
            success: true,
            message: 'پروژه با موفقیت بروزرسانی شد',
            data: updatedProject
        });
    }
    catch (error) {
        console.error('خطا در بروزرسانی پروژه:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در بروزرسانی پروژه',
            error: error.message
        });
    }
};
exports.updateProject = updateProject;
/**
 * حذف یک پروژه
 * DELETE /api/v1/projects/:id
 */
const deleteProject = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی وجود پروژه و دسترسی کاربر
        const existingProject = await prisma.project.findUnique({
            where: {
                id
            }
        });
        if (!existingProject) {
            return res.status(404).json({
                success: false,
                message: 'پروژه یافت نشد'
            });
        }
        if (existingProject.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز حذف این پروژه را ندارید'
            });
        }
        // حذف پروژه
        await prisma.project.delete({
            where: {
                id
            }
        });
        return res.status(200).json({
            success: true,
            message: 'پروژه با موفقیت حذف شد'
        });
    }
    catch (error) {
        console.error('خطا در حذف پروژه:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در حذف پروژه',
            error: error.message
        });
    }
};
exports.deleteProject = deleteProject;
