// Backend: backend/src/controllers/projectController.ts
// کنترلر مدیریت پروژه‌ها

import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export class ProjectController {
  // Create new project
  static async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { name, description, settings } = req.body;
      
      const project = await ProjectService.createProject({
        name,
        description,
        settings,
        userId: req.user.id
      });

      logger.info(`New project created: ${project.name} by ${req.user.email}`);

      res.status(201).json(
        ApiResponse.success('پروژه با موفقیت ایجاد شد', project)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get all user projects
  static async getUserProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { page = 1, limit = 10, search, status } = req.query;
      
      const result = await ProjectService.getUserProjects(req.user.id, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        status: status as string
      });

      res.json(
        ApiResponse.success('پروژه‌ها با موفقیت دریافت شد', result.projects, {
          pagination: {
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
            itemsPerPage: result.itemsPerPage
          }
        })
      );
    } catch (error) {
      next(error);
    }
  }

  // Get project by ID
  static async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const project = await ProjectService.getProjectById(id, req.user.id);

      if (!project) {
        throw new ApiError(404, 'پروژه یافت نشد');
      }

      res.json(
        ApiResponse.success('پروژه با موفقیت دریافت شد', project)
      );
    } catch (error) {
      next(error);
    }
  }

  // Update project
  static async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      const { name, description, status, settings } = req.body;
      
      const project = await ProjectService.updateProject(id, req.user.id, {
        name,
        description,
        status,
        settings
      });

      logger.info(`Project updated: ${project.name} by ${req.user.email}`);

      res.json(
        ApiResponse.success('پروژه با موفقیت به‌روزرسانی شد', project)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete project
  static async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      await ProjectService.deleteProject(id, req.user.id);

      logger.info(`Project deleted: ${id} by ${req.user.email}`);

      res.json(
        ApiResponse.success('پروژه با موفقیت حذف شد')
      );
    } catch (error) {
      next(error);
    }
  }

  // Get project statistics
  static async getProjectStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const stats = await ProjectService.getProjectStats(id, req.user.id);

      res.json(
        ApiResponse.success('آمار پروژه با موفقیت دریافت شد', stats)
      );
    } catch (error) {
      next(error);
    }
  }

  // Archive project
  static async archiveProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const project = await ProjectService.archiveProject(id, req.user.id);

      logger.info(`Project archived: ${project.name} by ${req.user.email}`);

      res.json(
        ApiResponse.success('پروژه با موفقیت بایگانی شد', project)
      );
    } catch (error) {
      next(error);
    }
  }

  // Restore archived project
  static async restoreProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const project = await ProjectService.restoreProject(id, req.user.id);

      logger.info(`Project restored: ${project.name} by ${req.user.email}`);

      res.json(
        ApiResponse.success('پروژه با موفقیت بازیابی شد', project)
      );
    } catch (error) {
      next(error);
    }
  }

  // Duplicate project
  static async duplicateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      const { name } = req.body;
      
      const project = await ProjectService.duplicateProject(id, req.user.id, name);

      logger.info(`Project duplicated: ${project.name} by ${req.user.email}`);

      res.status(201).json(
        ApiResponse.success('پروژه با موفقیت کپی شد', project)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectStats,
  archiveProject,
  restoreProject,
  duplicateProject
} = ProjectController;