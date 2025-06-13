// Backend: backend/src/controllers/documentController.ts
// کنترلر مدیریت مستندات

import { Request, Response, NextFunction } from 'express';
import { DocumentService } from '../services/DocumentService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export class DocumentController {
  // Create new document
  static async createDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { title, content, type, projectId, parentId, tags } = req.body;
      
      const document = await DocumentService.createDocument({
        title,
        content,
        type,
        projectId,
        parentId,
        tags,
        userId: req.user.id
      });

      logger.info(`New document created: ${document.title} by ${req.user.email}`);

      res.status(201).json(
        ApiResponse.success('مستند با موفقیت ایجاد شد', document)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get user documents
  static async getUserDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { 
        page = 1, 
        limit = 10, 
        search, 
        type, 
        status, 
        projectId,
        sortBy = 'updatedAt',
        sortOrder = 'desc'
      } = req.query;
      
      const result = await DocumentService.getUserDocuments(req.user.id, {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        search: search as string,
        type: type as string,
        status: status as string,
        projectId: projectId as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });

      res.json(
        ApiResponse.success('مستندات با موفقیت دریافت شد', result.documents, {
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

  // Get project documents
  static async getProjectDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { projectId } = req.params;
      const { includeArchived = false } = req.query;
      
      const documents = await DocumentService.getProjectDocuments(
        projectId, 
        req.user.id,
        includeArchived === 'true'
      );

      res.json(
        ApiResponse.success('مستندات پروژه با موفقیت دریافت شد', documents)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get document by ID
  static async getDocumentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const document = await DocumentService.getDocumentById(id, req.user.id);

      if (!document) {
        throw new ApiError(404, 'مستند یافت نشد');
      }

      res.json(
        ApiResponse.success('مستند با موفقیت دریافت شد', document)
      );
    } catch (error) {
      next(error);
    }
  }

  // Update document
  static async updateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      const { title, content, type, status, parentId, tags } = req.body;
      
      const document = await DocumentService.updateDocument(id, req.user.id, {
        title,
        content,
        type,
        status,
        parentId,
        tags
      });

      logger.info(`Document updated: ${document.title} by ${req.user.email}`);

      res.json(
        ApiResponse.success('مستند با موفقیت به‌روزرسانی شد', document)
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete document
  static async deleteDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      await DocumentService.deleteDocument(id, req.user.id);

      logger.info(`Document deleted: ${id} by ${req.user.email}`);

      res.json(
        ApiResponse.success('مستند با موفقیت حذف شد')
      );
    } catch (error) {
      next(error);
    }
  }

  // Publish document
  static async publishDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const document = await DocumentService.publishDocument(id, req.user.id);

      logger.info(`Document published: ${document.title} by ${req.user.email}`);

      res.json(
        ApiResponse.success('مستند با موفقیت منتشر شد', document)
      );
    } catch (error) {
      next(error);
    }
  }

  // Archive document
  static async archiveDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const document = await DocumentService.archiveDocument(id, req.user.id);

      logger.info(`Document archived: ${document.title} by ${req.user.email}`);

      res.json(
        ApiResponse.success('مستند با موفقیت بایگانی شد', document)
      );
    } catch (error) {
      next(error);
    }
  }

  // Duplicate document
  static async duplicateDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      const { title } = req.body;
      
      const document = await DocumentService.duplicateDocument(id, req.user.id, title);

      logger.info(`Document duplicated: ${document.title} by ${req.user.email}`);

      res.status(201).json(
        ApiResponse.success('مستند با موفقیت کپی شد', document)
      );
    } catch (error) {
      next(error);
    }
  }

  // Search documents
  static async searchDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { q, projectId, type, status, limit = 20 } = req.query;
      
      if (!q || (q as string).trim().length < 2) {
        throw new ApiError(400, 'عبارت جستجو باید حداقل ۲ کاراکتر باشد');
      }

      const results = await DocumentService.searchDocuments(req.user.id, {
        query: q as string,
        projectId: projectId as string,
        type: type as string,
        status: status as string,
        limit: parseInt(limit as string)
      });

      res.json(
        ApiResponse.success('نتایج جستجو با موفقیت دریافت شد', results)
      );
    } catch (error) {
      next(error);
    }
  }

  // Get document statistics
  static async getDocumentStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new ApiError(401, 'کاربر احراز هویت نشده است');
      }

      const { id } = req.params;
      
      const stats = await DocumentService.getDocumentStats(id, req.user.id);

      res.json(
        ApiResponse.success('آمار مستند با موفقیت دریافت شد', stats)
      );
    } catch (error) {
      next(error);
    }
  }
}

export const {
  createDocument,
  getUserDocuments,
  getProjectDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  publishDocument,
  archiveDocument,
  duplicateDocument,
  searchDocuments,
  getDocumentStats
} = DocumentController;