import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth';

const prisma = new PrismaClient();

// ایجاد سند جدید
export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, type, projectId } = req.body;
    const userId = req.user?.id;

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
  } catch (error) {
    console.error('خطا در ایجاد سند:', error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};

// دریافت همه اسناد کاربر
export const getUserDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { projectId } = req.query;

    if (!userId) {
      return res.status(401).json({ message: 'کاربر احراز هویت نشده است' });
    }

    const whereClause: any = { userId };
    if (projectId) {
      whereClause.projectId = projectId as string;
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
  } catch (error) {
    console.error('خطا در دریافت اسناد:', error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};

// دریافت سند با شناسه
export const getDocumentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
  } catch (error) {
    console.error('خطا در دریافت سند:', error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};

// به‌روزرسانی سند
export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, type, status, projectId } = req.body;
    const userId = req.user?.id;

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
  } catch (error) {
    console.error('خطا در به‌روزرسانی سند:', error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};

// حذف سند
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
  } catch (error) {
    console.error('خطا در حذف سند:', error);
    res.status(500).json({ message: 'خطای داخلی سرور' });
  }
};