"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.getUserDocuments = exports.createDocument = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ایجاد سند جدید
const createDocument = async (req, res) => {
    var _a;
    try {
        const { title, content, type, projectId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'کاربر احراز هویت نشده است' });
        }
        const document = await prisma.document.create({
            data: {
                title,
                content,
                type,
                projectId,
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
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            data: document,
        });
    }
    catch (error) {
        console.error('خطا در ایجاد سند:', error);
        res.status(500).json({ message: 'خطای داخلی سرور' });
    }
};
exports.createDocument = createDocument;
// دریافت همه اسناد کاربر
const getUserDocuments = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { projectId } = req.query;
        if (!userId) {
            return res.status(401).json({ message: 'کاربر احراز هویت نشده است' });
        }
        const whereClause = { userId };
        if (projectId) {
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
            data: documents,
        });
    }
    catch (error) {
        console.error('خطا در دریافت اسناد:', error);
        res.status(500).json({ message: 'خطای داخلی سرور' });
    }
};
exports.getUserDocuments = getUserDocuments;
// دریافت سند با شناسه
const getDocumentById = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'کاربر احراز هویت نشده است' });
        }
        const document = await prisma.document.findFirst({
            where: {
                id,
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
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!document) {
            return res.status(404).json({ message: 'سند یافت نشد' });
        }
        res.json({
            success: true,
            data: document,
        });
    }
    catch (error) {
        console.error('خطا در دریافت سند:', error);
        res.status(500).json({ message: 'خطای داخلی سرور' });
    }
};
exports.getDocumentById = getDocumentById;
// به‌روزرسانی سند
const updateDocument = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { title, content, type, status, projectId } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'کاربر احراز هویت نشده است' });
        }
        // بررسی وجود سند و مالکیت
        const existingDocument = await prisma.document.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingDocument) {
            return res.status(404).json({ message: 'سند یافت نشد' });
        }
        const document = await prisma.document.update({
            where: { id },
            data: {
                title,
                content,
                type,
                status,
                projectId,
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
        res.json({
            success: true,
            data: document,
        });
    }
    catch (error) {
        console.error('خطا در به‌روزرسانی سند:', error);
        res.status(500).json({ message: 'خطای داخلی سرور' });
    }
};
exports.updateDocument = updateDocument;
// حذف سند
const deleteDocument = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({ message: 'کاربر احراز هویت نشده است' });
        }
        // بررسی وجود سند و مالکیت
        const existingDocument = await prisma.document.findFirst({
            where: {
                id,
                userId,
            },
        });
        if (!existingDocument) {
            return res.status(404).json({ message: 'سند یافت نشد' });
        }
        await prisma.document.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: 'سند با موفقیت حذف شد',
        });
    }
    catch (error) {
        console.error('خطا در حذف سند:', error);
        res.status(500).json({ message: 'خطای داخلی سرور' });
    }
};
exports.deleteDocument = deleteDocument;
