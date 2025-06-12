import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

/**
 * ایجاد نسخه جدید از مستند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const createDocumentVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const { title, content, changelog, isPublished } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی وجود مستند و مالکیت
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'مستند یافت نشد یا شما دسترسی ندارید' });
    }

    // محاسبه شماره نسخه جدید
    const nextVersionNumber = document.versions.length > 0 ? document.versions[0].versionNumber + 1 : 1;

    // ایجاد نسخه جدید
    const version = await prisma.documentVersion.create({
      data: {
        versionNumber: nextVersionNumber,
        title: title || document.title,
        content,
        changelog,
        isPublished: isPublished || false,
        documentId,
        userId,
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'نسخه جدید مستند با موفقیت ایجاد شد',
      data: version,
    });
  } catch (error) {
    console.error('خطا در ایجاد نسخه جدید مستند:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * دریافت همه نسخه‌های یک مستند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const getDocumentVersions = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی دسترسی به مستند
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'مستند یافت نشد یا شما دسترسی ندارید' });
    }

    // دریافت نسخه‌ها
    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'نسخه‌های مستند با موفقیت دریافت شدند',
      data: versions,
    });
  } catch (error) {
    console.error('خطا در دریافت نسخه‌های مستند:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * دریافت یک نسخه خاص از مستند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const getDocumentVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, versionNumber } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی دسترسی به مستند
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'مستند یافت نشد یا شما دسترسی ندارید' });
    }

    // دریافت نسخه مشخص
    const version = await prisma.documentVersion.findFirst({
      where: {
        documentId,
        versionNumber: parseInt(versionNumber),
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'نسخه مورد نظر یافت نشد' });
    }

    res.json({
      success: true,
      message: 'نسخه مستند با موفقیت دریافت شد',
      data: version,
    });
  } catch (error) {
    console.error('خطا در دریافت نسخه مستند:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * حذف یک نسخه از مستند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const deleteDocumentVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, versionNumber } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی دسترسی به مستند
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'مستند یافت نشد یا شما دسترسی ندارید' });
    }

    // بررسی وجود نسخه
    const version = await prisma.documentVersion.findFirst({
      where: {
        documentId,
        versionNumber: parseInt(versionNumber),
      },
    });

    if (!version) {
      return res.status(404).json({ success: false, message: 'نسخه مورد نظر یافت نشد' });
    }

    // حذف نسخه
    await prisma.documentVersion.delete({
      where: { id: version.id },
    });

    res.json({
      success: true,
      message: 'نسخه مستند با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('خطا در حذف نسخه مستند:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
}; 