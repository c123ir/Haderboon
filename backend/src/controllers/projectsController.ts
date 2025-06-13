// backend/src/controllers/projectsController.ts

import { Response } from 'express';
import { prisma } from '../server';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils';

/**
 * Get all projects for authenticated user
 */
export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 10, search, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Build where clause
    const where: any = { userId };
    
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      where.status = String(status).toUpperCase();
    }

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          filesCount: true,
          totalSize: true,
          lastAnalyzed: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              files: true,
              docs: true,
              chats: true
            }
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    sendSuccess(res, {
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }, 'فهرست پروژه‌ها');

  } catch (error) {
    console.error('❌ Get projects error:', error);
    sendError(res, 'خطا در دریافت پروژه‌ها');
  }
};

/**
 * Get single project by ID
 */
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        files: {
          take: 10,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            name: true,
            path: true,
            type: true,
            size: true,
            isDirectory: true,
            updatedAt: true
          }
        },
        docs: {
          take: 5,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            files: true,
            docs: true,
            chats: true,
            prompts: true
          }
        }
      }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    sendSuccess(res, project, 'جزئیات پروژه');

  } catch (error) {
    console.error('❌ Get project error:', error);
    sendError(res, 'خطا در دریافت پروژه');
  }
};

/**
 * Create new project
 */
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;

    // Validation
    if (!name?.trim()) {
      sendError(res, 'نام پروژه الزامی است', 400);
      return;
    }

    // Check for duplicate names
    const existingProject = await prisma.project.findFirst({
      where: {
        name: name.trim(),
        userId
      }
    });

    if (existingProject) {
      sendError(res, 'پروژه‌ای با این نام قبلاً ایجاد شده است', 409);
      return;
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        userId,
        status: 'UPLOADING'
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            files: true,
            docs: true,
            chats: true
          }
        }
      }
    });

    sendSuccess(res, project, 'پروژه با موفقیت ایجاد شد', 201);

  } catch (error) {
    console.error('❌ Create project error:', error);
    sendError(res, 'خطا در ایجاد پروژه');
  }
};

/**
 * Update project
 */
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, description } = req.body;

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!existingProject) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Validation
    if (name && !name.trim()) {
      sendError(res, 'نام پروژه نمی‌تواند خالی باشد', 400);
      return;
    }

    // Check for duplicate names (if name is being changed)
    if (name && name.trim() !== existingProject.name) {
      const duplicateProject = await prisma.project.findFirst({
        where: {
          name: name.trim(),
          userId,
          id: { not: id }
        }
      });

      if (duplicateProject) {
        sendError(res, 'پروژه‌ای با این نام قبلاً وجود دارد', 409);
        return;
      }
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            files: true,
            docs: true,
            chats: true
          }
        }
      }
    });

    sendSuccess(res, updatedProject, 'پروژه با موفقیت به‌روزرسانی شد');

  } catch (error) {
    console.error('❌ Update project error:', error);
    sendError(res, 'خطا در به‌روزرسانی پروژه');
  }
};

/**
 * Delete project
 */
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: { id, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Delete project (cascade will handle related records)
    await prisma.project.delete({
      where: { id }
    });

    sendSuccess(res, null, 'پروژه با موفقیت حذف شد');

  } catch (error) {
    console.error('❌ Delete project error:', error);
    sendError(res, 'خطا در حذف پروژه');
  }
};

/**
 * Get project statistics
 */
export const getProjectStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            projects: true
          }
        },
        projects: {
          select: {
            status: true,
            _count: {
              select: {
                files: true,
                docs: true,
                chats: true
              }
            }
          }
        }
      }
    });

    if (!stats) {
      sendError(res, 'کاربر یافت نشد', 404);
      return;
    }

    // Calculate statistics
    const projectsByStatus = stats.projects.reduce((acc: any, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {});

    const totalFiles = stats.projects.reduce((total, project) => 
      total + project._count.files, 0
    );

    const totalDocs = stats.projects.reduce((total, project) => 
      total + project._count.docs, 0
    );

    const totalChats = stats.projects.reduce((total, project) => 
      total + project._count.chats, 0
    );

    sendSuccess(res, {
      totalProjects: stats._count.projects,
      projectsByStatus,
      totalFiles,
      totalDocs,
      totalChats
    }, 'آمار پروژه‌ها');

  } catch (error) {
    console.error('❌ Get project stats error:', error);
    sendError(res, 'خطا در دریافت آمار');
  }
};