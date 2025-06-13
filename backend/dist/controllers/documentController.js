"use strict";
// مسیر فایل: src/controllers/documentController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.getUserDocuments = exports.createDocument = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * ایجاد سند جدید
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const createDocument = async (req, res) => {
    var _a;
    try {
        const { title, content, type, projectId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // دسترسی به کاربر از طریق req.user
        if (!userId) {
            return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
        }
        const document = await prisma.document.create({
            data: {
                title,
                content,
                type,
                projectId, // اگر projectId اختیاری است، باید در schema هم مشخص شود
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                project: projectId ? {
                    select: {
                        id: true,
                        name: true,
                    },
                } : undefined,
            },
        });
        res.status(201).json({
            success: true,
            message: 'سند با موفقیت ایجاد شد',
            data: document,
        });
    }
    catch (error) {
        console.error('خطا در ایجاد سند:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
    }
};
exports.createDocument = createDocument;
/**
 * دریافت همه اسناد کاربر
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const getUserDocuments = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { projectId } = req.query;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
        }
        const whereClause = { userId };
        if (projectId && typeof projectId === 'string') { // بررسی نوع projectId
            whereClause.projectId = projectId;
        }
        const documents = await prisma.document.findMany({
            where: whereClause,
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        res.json({
            success: true,
            message: 'اسناد با موفقیت دریافت شدند',
            data: documents,
        });
    }
    catch (error) {
        console.error('خطا در دریافت اسناد:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
    }
};
exports.getUserDocuments = getUserDocuments;
/**
 * دریافت سند با شناسه
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const getDocumentById = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
        }
        const document = await prisma.document.findFirst({
            where: {
                id,
                userId, // اطمینان از اینکه کاربر فقط به اسناد خودش دسترسی دارد
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!document) {
            return res.status(404).json({ success: false, message: 'سند یافت نشد' });
        }
        res.json({
            success: true,
            message: 'سند با موفقیت دریافت شد',
            data: document,
        });
    }
    catch (error) {
        console.error('خطا در دریافت سند:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
    }
};
exports.getDocumentById = getDocumentById;
/**
 * به‌روزرسانی سند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const updateDocument = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { title, content, type, status, projectId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
        }
        // بررسی وجود سند و مالکیت
        const existingDocument = await prisma.document.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingDocument) {
            return res.status(404).json({ success: false, message: 'سند یافت نشد یا شما دسترسی ندارید' });
        }
        const document = await prisma.document.update({
            where: { id }, // اطمینان از اینکه فقط سند متعلق به کاربر آپدیت می‌شود، قبلا با existingDocument چک شده
            data: {
                title,
                content,
                type,
                status,
                projectId, // اگر projectId اختیاری است، باید در schema هم مشخص شود
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                project: projectId ? {
                    select: {
                        id: true,
                        name: true,
                    },
                } : undefined,
            },
        });
        res.json({
            success: true,
            message: 'سند با موفقیت به‌روزرسانی شد',
            data: document,
        });
    }
    catch (error) {
        console.error('خطا در به‌روزرسانی سند:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
    }
};
exports.updateDocument = updateDocument;
/**
 * حذف سند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
const deleteDocument = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
        }
        // بررسی وجود سند و مالکیت
        const existingDocument = await prisma.document.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingDocument) {
            return res.status(404).json({ success: false, message: 'سند یافت نشد یا شما دسترسی ندارید' });
        }
        await prisma.document.delete({
            where: { id }, // اطمینان از اینکه فقط سند متعلق به کاربر حذف می‌شود، قبلا با existingDocument چک شده
        });
        res.json({
            success: true,
            message: 'سند با موفقیت حذف شد',
        });
    }
    catch (error) {
        console.error('خطا در حذف سند:', error);
        res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
    }
};
exports.deleteDocument = deleteDocument;
