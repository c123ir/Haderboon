// مسیر فایل: src/controllers/projectController.ts
// کنترلر مدیریت پروژه‌ها

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * ایجاد پروژه جدید
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, repositoryUrl, language, framework } = req.body;
    const userId = (req as any).user?.id;

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
        repositoryUrl,
        language,
        framework,
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'پروژه با موفقیت ایجاد شد',
      data: project,
    });
  } catch (error) {
    console.error('خطا در ایجاد پروژه:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در ایجاد پروژه',
      error: error instanceof Error ? error.message : 'خطای نامشخص',
    });
  }
};

/**
 * دریافت همه پروژه‌های کاربر
 */
export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'کاربر احراز هویت نشده است',
      });
    }

    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        documents: {
          select: {
            id: true,
            title: true,
            type: true,
            createdAt: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'پروژه‌ها با موفقیت دریافت شدند',
      data: projects,
    });
  } catch (error) {
    console.error('خطا در دریافت پروژه‌ها:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پروژه‌ها',
      error: error instanceof Error ? error.message : 'خطای نامشخص',
    });
  }
};

/**
 * دریافت پروژه با شناسه
 */
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'کاربر احراز هویت نشده است',
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'پروژه یافت نشد',
      });
    }

    res.json({
      success: true,
      message: 'پروژه با موفقیت دریافت شد',
      data: project,
    });
  } catch (error) {
    console.error('خطا در دریافت پروژه:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در دریافت پروژه',
      error: error instanceof Error ? error.message : 'خطای نامشخص',
    });
  }
};

/**
 * به‌روزرسانی پروژه
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, repositoryUrl, language, framework } = req.body;
    const userId = (req as any).user?.id;

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
        message: 'پروژه یافت نشد',
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        repositoryUrl,
        language,
        framework,
      },
    });

    res.json({
      success: true,
      message: 'پروژه با موفقیت به‌روزرسانی شد',
      data: updatedProject,
    });
  } catch (error) {
    console.error('خطا در به‌روزرسانی پروژه:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در به‌روزرسانی پروژه',
      error: error instanceof Error ? error.message : 'خطای نامشخص',
    });
  }
};

/**
 * حذف پروژه
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

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
        message: 'پروژه یافت نشد',
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'پروژه با موفقیت حذف شد',
    });
  } catch (error) {
    console.error('خطا در حذف پروژه:', error);
    res.status(500).json({
      success: false,
      message: 'خطا در حذف پروژه',
      error: error instanceof Error ? error.message : 'خطای نامشخص',
    });
  }
};