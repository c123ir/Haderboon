// backend/src/controllers/projectController.ts
// کنترلر مدیریت پروژه‌ها در ایجنت هادربون

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreateProjectDto, UpdateProjectDto } from '../types/project.types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// ایجاد نمونه از Prisma Client
const prisma = new PrismaClient();

/**
 * ایجاد پروژه جدید
 * POST /api/v1/projects
 */
export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // دریافت اطلاعات پروژه از بدنه درخواست
    const { name, description, path } = req.body as CreateProjectDto;
    
    // دریافت شناسه کاربر از احراز هویت
    const userId = req.user?.id;
    
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
    
  } catch (error: any) {
    console.error('خطا در ایجاد پروژه:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطای سرور در ایجاد پروژه',
      error: error.message 
    });
  }
};

/**
 * دریافت همه پروژه‌های کاربر
 * GET /api/v1/projects
 */
export const getAllProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // دریافت شناسه کاربر از احراز هویت
    const userId = req.user?.id;
    
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
    
  } catch (error: any) {
    console.error('خطا در دریافت پروژه‌ها:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطای سرور در دریافت پروژه‌ها',
      error: error.message 
    });
  }
};

/**
 * دریافت اطلاعات یک پروژه با شناسه
 * GET /api/v1/projects/:id
 */
export const getProjectById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
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
    
  } catch (error: any) {
    console.error('خطا در دریافت پروژه:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطای سرور در دریافت پروژه',
      error: error.message 
    });
  }
};

/**
 * بروزرسانی اطلاعات یک پروژه
 * PUT /api/v1/projects/:id
 */
export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, path } = req.body as UpdateProjectDto;
    const userId = req.user?.id;
    
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
    
  } catch (error: any) {
    console.error('خطا در بروزرسانی پروژه:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطای سرور در بروزرسانی پروژه',
      error: error.message 
    });
  }
};

/**
 * حذف یک پروژه
 * DELETE /api/v1/projects/:id
 */
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
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
    
  } catch (error: any) {
    console.error('خطا در حذف پروژه:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'خطای سرور در حذف پروژه',
      error: error.message 
    });
  }
}; 