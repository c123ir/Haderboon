import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

/**
 * ایجاد تگ جدید
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const createTag = async (req: AuthRequest, res: Response) => {
  try {
    const { name, color } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'نام تگ الزامی است' });
    }

    // بررسی عدم تکرار نام تگ برای کاربر
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.trim(),
        userId,
      },
    });

    if (existingTag) {
      return res.status(409).json({ success: false, message: 'تگ با این نام قبلاً وجود دارد' });
    }

    // ایجاد تگ جدید
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        color: color || '#3B82F6',
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'تگ با موفقیت ایجاد شد',
      data: tag,
    });
  } catch (error) {
    console.error('خطا در ایجاد تگ:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * دریافت همه تگ‌های کاربر
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const getUserTags = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      message: 'تگ‌ها با موفقیت دریافت شدند',
      data: tags,
    });
  } catch (error) {
    console.error('خطا در دریافت تگ‌ها:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * دریافت اطلاعات یک تگ
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const getTagById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    const tag = await prisma.tag.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        documents: {
          include: {
            document: {
              select: {
                id: true,
                title: true,
                status: true,
                updatedAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!tag) {
      return res.status(404).json({ success: false, message: 'تگ یافت نشد' });
    }

    res.json({
      success: true,
      message: 'تگ با موفقیت دریافت شد',
      data: tag,
    });
  } catch (error) {
    console.error('خطا در دریافت تگ:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * بروزرسانی تگ
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const updateTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی وجود تگ و مالکیت
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTag) {
      return res.status(404).json({ success: false, message: 'تگ یافت نشد یا شما دسترسی ندارید' });
    }

    // بررسی عدم تکرار نام جدید
    if (name && name.trim() !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          name: name.trim(),
          userId,
          id: { not: id },
        },
      });

      if (duplicateTag) {
        return res.status(409).json({ success: false, message: 'تگ با این نام قبلاً وجود دارد' });
      }
    }

    // بروزرسانی تگ
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(color && { color }),
      },
      include: {
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'تگ با موفقیت بروزرسانی شد',
      data: updatedTag,
    });
  } catch (error) {
    console.error('خطا در بروزرسانی تگ:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * حذف تگ
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const deleteTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی وجود تگ و مالکیت
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTag) {
      return res.status(404).json({ success: false, message: 'تگ یافت نشد یا شما دسترسی ندارید' });
    }

    // حذف تگ (روابط با مستندات به صورت خودکار حذف می‌شوند)
    await prisma.tag.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'تگ با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('خطا در حذف تگ:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * اختصاص تگ به مستند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const assignTagToDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, tagId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی وجود مستند و تگ و مالکیت
    const [document, tag] = await Promise.all([
      prisma.document.findFirst({
        where: { id: documentId, userId },
      }),
      prisma.tag.findFirst({
        where: { id: tagId, userId },
      }),
    ]);

    if (!document) {
      return res.status(404).json({ success: false, message: 'مستند یافت نشد یا شما دسترسی ندارید' });
    }

    if (!tag) {
      return res.status(404).json({ success: false, message: 'تگ یافت نشد یا شما دسترسی ندارید' });
    }

    // بررسی عدم تکرار رابطه
    const existingRelation = await prisma.documentTag.findUnique({
      where: {
        documentId_tagId: {
          documentId,
          tagId,
        },
      },
    });

    if (existingRelation) {
      return res.status(409).json({ success: false, message: 'این تگ قبلاً به مستند اختصاص داده شده است' });
    }

    // ایجاد رابطه
    await prisma.documentTag.create({
      data: {
        documentId,
        tagId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'تگ با موفقیت به مستند اختصاص داده شد',
    });
  } catch (error) {
    console.error('خطا در اختصاص تگ به مستند:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
};

/**
 * حذف تگ از مستند
 * @param req - درخواست HTTP احراز هویت شده
 * @param res - پاسخ HTTP
 */
export const removeTagFromDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId, tagId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'کاربر احراز هویت نشده است' });
    }

    // بررسی وجود مستند و تگ و مالکیت
    const [document, tag] = await Promise.all([
      prisma.document.findFirst({
        where: { id: documentId, userId },
      }),
      prisma.tag.findFirst({
        where: { id: tagId, userId },
      }),
    ]);

    if (!document) {
      return res.status(404).json({ success: false, message: 'مستند یافت نشد یا شما دسترسی ندارید' });
    }

    if (!tag) {
      return res.status(404).json({ success: false, message: 'تگ یافت نشد یا شما دسترسی ندارید' });
    }

    // حذف رابطه
    const deletedRelation = await prisma.documentTag.deleteMany({
      where: {
        documentId,
        tagId,
      },
    });

    if (deletedRelation.count === 0) {
      return res.status(404).json({ success: false, message: 'این تگ به مستند اختصاص داده نشده است' });
    }

    res.json({
      success: true,
      message: 'تگ با موفقیت از مستند حذف شد',
    });
  } catch (error) {
    console.error('خطا در حذف تگ از مستند:', error);
    res.status(500).json({ success: false, message: 'خطای داخلی سرور' });
  }
}; 