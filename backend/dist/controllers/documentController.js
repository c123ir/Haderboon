"use strict";
// backend/src/controllers/documentController.ts
// کنترلر مدیریت مستندات در ایجنت هادربون
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentVersion = exports.createDocumentVersion = exports.deleteDocument = exports.updateDocument = exports.getDocumentById = exports.getProjectDocuments = exports.createDocument = void 0;
const prisma_1 = require("../generated/prisma");
// ایجاد نمونه از Prisma Client
const prisma = new prisma_1.PrismaClient();
/**
 * ایجاد مستند جدید به همراه نسخه اولیه
 * POST /api/v1/documents
 */
const createDocument = async (req, res) => {
    var _a;
    try {
        // دریافت اطلاعات مستند از بدنه درخواست
        const { title, description, path, projectId, parentId, tags = [], content } = req.body;
        // دریافت شناسه کاربر از احراز هویت
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی داده‌های ورودی
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'عنوان مستند الزامی است'
            });
        }
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'شناسه پروژه الزامی است'
            });
        }
        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'محتوای مستند الزامی است'
            });
        }
        // بررسی وجود پروژه و دسترسی کاربر
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'پروژه مورد نظر یافت نشد'
            });
        }
        // ایجاد مستند جدید با تراکنش
        const result = await prisma.$transaction(async (tx) => {
            // ایجاد مستند
            const newDocument = await tx.document.create({
                data: {
                    title,
                    description,
                    path,
                    tags,
                    projectId,
                    ownerId: userId,
                    parentId
                }
            });
            // ایجاد نسخه اولیه مستند
            const newDocumentVersion = await tx.documentVersion.create({
                data: {
                    content,
                    documentId: newDocument.id,
                    authorId: userId,
                    versionNumber: 1,
                    isPublished: true
                }
            });
            return { document: newDocument, version: newDocumentVersion };
        });
        return res.status(201).json({
            success: true,
            message: 'مستند با موفقیت ایجاد شد',
            data: Object.assign(Object.assign({}, result.document), { latestVersion: result.version })
        });
    }
    catch (error) {
        console.error('خطا در ایجاد مستند:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در ایجاد مستند',
            error: error.message
        });
    }
};
exports.createDocument = createDocument;
/**
 * دریافت همه مستندات یک پروژه
 * GET /api/v1/projects/:projectId/documents
 */
const getProjectDocuments = async (req, res) => {
    var _a;
    try {
        const { projectId } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی وجود پروژه و دسترسی کاربر
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'پروژه مورد نظر یافت نشد'
            });
        }
        if (project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز دسترسی به این پروژه را ندارید'
            });
        }
        // دریافت همه مستندات پروژه
        const documents = await prisma.document.findMany({
            where: {
                projectId,
                parentId: null // فقط مستندات سطح اول
            },
            orderBy: {
                updatedAt: 'desc'
            },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc'
                    },
                    take: 1
                },
                children: {
                    include: {
                        versions: {
                            orderBy: {
                                versionNumber: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        // تبدیل به ساختار درختی
        const documentsWithLatestVersion = documents.map(doc => (Object.assign(Object.assign({}, doc), { latestVersion: doc.versions[0] || null, versions: undefined, children: doc.children.map(child => (Object.assign(Object.assign({}, child), { latestVersion: child.versions[0] || null, versions: undefined }))) })));
        return res.status(200).json({
            success: true,
            message: 'مستندات با موفقیت دریافت شدند',
            data: documentsWithLatestVersion
        });
    }
    catch (error) {
        console.error('خطا در دریافت مستندات:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در دریافت مستندات',
            error: error.message
        });
    }
};
exports.getProjectDocuments = getProjectDocuments;
/**
 * دریافت یک مستند با شناسه
 * GET /api/v1/documents/:id
 */
const getDocumentById = async (req, res) => {
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
        // دریافت مستند با نسخه‌های آن
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc'
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                },
                project: true,
                owner: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        name: true
                    }
                },
                parent: true,
                children: {
                    include: {
                        versions: {
                            orderBy: {
                                versionNumber: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });
        // بررسی وجود مستند
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'مستند یافت نشد'
            });
        }
        // بررسی مجوز دسترسی (فقط مالک پروژه یا مستند)
        if (document.ownerId !== userId && document.project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز دسترسی به این مستند را ندارید'
            });
        }
        // تنظیم ساختار پاسخ
        const latestVersion = document.versions[0] || null;
        const documentWithLatestVersion = Object.assign(Object.assign({}, document), { latestVersion, children: document.children.map(child => (Object.assign(Object.assign({}, child), { latestVersion: child.versions[0] || null, versions: undefined }))) });
        return res.status(200).json({
            success: true,
            message: 'مستند با موفقیت دریافت شد',
            data: documentWithLatestVersion
        });
    }
    catch (error) {
        console.error('خطا در دریافت مستند:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در دریافت مستند',
            error: error.message
        });
    }
};
exports.getDocumentById = getDocumentById;
/**
 * بروزرسانی اطلاعات یک مستند
 * PUT /api/v1/documents/:id
 */
const updateDocument = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { title, description, path, projectId, parentId, tags } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی وجود مستند و دسترسی کاربر
        const existingDocument = await prisma.document.findUnique({
            where: { id },
            include: {
                project: true
            }
        });
        if (!existingDocument) {
            return res.status(404).json({
                success: false,
                message: 'مستند یافت نشد'
            });
        }
        if (existingDocument.ownerId !== userId && existingDocument.project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز ویرایش این مستند را ندارید'
            });
        }
        // بررسی تغییر پروژه
        if (projectId && projectId !== existingDocument.projectId) {
            const newProject = await prisma.project.findUnique({
                where: { id: projectId }
            });
            if (!newProject) {
                return res.status(404).json({
                    success: false,
                    message: 'پروژه مورد نظر یافت نشد'
                });
            }
            if (newProject.ownerId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'شما مجوز انتقال مستند به این پروژه را ندارید'
                });
            }
        }
        // بروزرسانی مستند
        const updatedDocument = await prisma.document.update({
            where: { id },
            data: {
                title,
                description,
                path,
                projectId,
                parentId,
                tags
            },
            include: {
                versions: {
                    orderBy: {
                        versionNumber: 'desc'
                    },
                    take: 1
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: 'مستند با موفقیت بروزرسانی شد',
            data: Object.assign(Object.assign({}, updatedDocument), { latestVersion: updatedDocument.versions[0] || null, versions: undefined })
        });
    }
    catch (error) {
        console.error('خطا در بروزرسانی مستند:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در بروزرسانی مستند',
            error: error.message
        });
    }
};
exports.updateDocument = updateDocument;
/**
 * حذف یک مستند
 * DELETE /api/v1/documents/:id
 */
const deleteDocument = async (req, res) => {
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
        // بررسی وجود مستند و دسترسی کاربر
        const existingDocument = await prisma.document.findUnique({
            where: { id },
            include: {
                project: true,
                children: true
            }
        });
        if (!existingDocument) {
            return res.status(404).json({
                success: false,
                message: 'مستند یافت نشد'
            });
        }
        if (existingDocument.ownerId !== userId && existingDocument.project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز حذف این مستند را ندارید'
            });
        }
        // بررسی وجود مستندات زیرمجموعه
        if (existingDocument.children.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'این مستند دارای زیرمستنداتی است. ابتدا آنها را حذف کنید'
            });
        }
        // حذف مستند (نسخه‌ها به صورت CASCADE حذف می‌شوند)
        await prisma.document.delete({
            where: { id }
        });
        return res.status(200).json({
            success: true,
            message: 'مستند با موفقیت حذف شد'
        });
    }
    catch (error) {
        console.error('خطا در حذف مستند:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در حذف مستند',
            error: error.message
        });
    }
};
exports.deleteDocument = deleteDocument;
/**
 * ایجاد نسخه جدید برای یک مستند
 * POST /api/v1/documents/:id/versions
 */
const createDocumentVersion = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { content, changelog, isPublished = true } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی وجود مستند و دسترسی کاربر
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                project: true,
                versions: {
                    orderBy: {
                        versionNumber: 'desc'
                    },
                    take: 1
                }
            }
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'مستند یافت نشد'
            });
        }
        if (document.ownerId !== userId && document.project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز ایجاد نسخه جدید برای این مستند را ندارید'
            });
        }
        // تعیین شماره نسخه جدید
        const currentVersion = document.versions[0];
        const newVersionNumber = currentVersion ? currentVersion.versionNumber + 1 : 1;
        // ایجاد نسخه جدید
        const newVersion = await prisma.documentVersion.create({
            data: {
                content,
                documentId: id,
                authorId: userId,
                versionNumber: newVersionNumber,
                changelog,
                isPublished
            }
        });
        return res.status(201).json({
            success: true,
            message: 'نسخه جدید مستند با موفقیت ایجاد شد',
            data: newVersion
        });
    }
    catch (error) {
        console.error('خطا در ایجاد نسخه جدید مستند:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در ایجاد نسخه جدید مستند',
            error: error.message
        });
    }
};
exports.createDocumentVersion = createDocumentVersion;
/**
 * دریافت یک نسخه مشخص از مستند
 * GET /api/v1/documents/:id/versions/:versionNumber
 */
const getDocumentVersion = async (req, res) => {
    var _a;
    try {
        const { id, versionNumber } = req.params;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'کاربر احراز هویت نشده است'
            });
        }
        // بررسی وجود مستند و دسترسی کاربر
        const document = await prisma.document.findUnique({
            where: { id },
            include: {
                project: true
            }
        });
        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'مستند یافت نشد'
            });
        }
        if (document.ownerId !== userId && document.project.ownerId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'شما مجوز دسترسی به این مستند را ندارید'
            });
        }
        // دریافت نسخه مورد نظر
        const version = await prisma.documentVersion.findFirst({
            where: {
                documentId: id,
                versionNumber: parseInt(versionNumber)
            },
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        name: true
                    }
                }
            }
        });
        if (!version) {
            return res.status(404).json({
                success: false,
                message: 'نسخه مورد نظر یافت نشد'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'نسخه مستند با موفقیت دریافت شد',
            data: version
        });
    }
    catch (error) {
        console.error('خطا در دریافت نسخه مستند:', error);
        return res.status(500).json({
            success: false,
            message: 'خطای سرور در دریافت نسخه مستند',
            error: error.message
        });
    }
};
exports.getDocumentVersion = getDocumentVersion;
