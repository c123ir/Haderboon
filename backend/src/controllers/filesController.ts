// backend/src/controllers/filesController.ts

import { Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../server';
import { AuthRequest, UploadedFileInfo } from '../types';
import { sendSuccess, sendError, getFileType, formatFileSize, generateUniqueFilename } from '../utils';
import { analyzeFile, analyzeProject } from '../services/fileAnalysisService';
import { extractZipFile } from '../middleware/upload';

/**
 * Upload multiple files to a project
 */
export const uploadFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      sendError(res, 'هیچ فایلی آپلود نشده است', 400);
      return;
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Update project status to ANALYZING
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'ANALYZING' }
    });

    const uploadedFiles: any[] = [];
    let totalSize = 0;

    // Process each uploaded file
    for (const file of files) {
      try {
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const fileSize = file.size;
        const fileType = getFileType(originalName);
        const extension = path.extname(originalName);
        
        totalSize += fileSize;

        // Analyze file if it's a text file
        let analysis = null;
        try {
          analysis = await analyzeFile(file.path);
        } catch (error) {
          console.warn(`خطا در تحلیل فایل ${originalName}:`, error);
        }

        // Read file content for text files (limit size)
        let content = null;
        if (fileSize < 500 * 1024 && // Less than 500KB
            ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.html', '.css', '.scss', '.json', '.md', '.txt'].includes(extension)) {
          try {
            content = fs.readFileSync(file.path, 'utf8');
          } catch (error) {
            console.warn(`خطا در خواندن محتوای فایل ${originalName}:`, error);
          }
        }

        // Create file record in database
        const projectFile = await prisma.projectFile.create({
          data: {
            projectId,
            path: originalName,
            originalPath: file.path,
            name: path.basename(originalName),
            extension,
            type: fileType as any,
            size: BigInt(fileSize),
            content,
            analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
            isDirectory: false
          }
        });

        uploadedFiles.push({
          id: projectFile.id,
          name: originalName,
          size: fileSize,
          type: fileType,
          analysis: analysis
        });

      } catch (error) {
        console.error(`خطا در پردازش فایل ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    // Update project statistics
    await prisma.project.update({
      where: { id: projectId },
      data: {
        filesCount: uploadedFiles.length,
        totalSize: BigInt(totalSize),
        status: 'READY',
        lastAnalyzed: new Date(),
        updatedAt: new Date()
      }
    });

    sendSuccess(res, {
      uploadedFiles,
      totalFiles: uploadedFiles.length,
      totalSize,
      projectId
    }, `${uploadedFiles.length} فایل با موفقیت آپلود شد`);

  } catch (error) {
    console.error('❌ Upload files error:', error);
    sendError(res, 'خطا در آپلود فایل‌ها');
  }
};

/**
 * Upload project as ZIP file
 */
export const uploadProjectZip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;
    const zipFile = req.file;

    if (!zipFile) {
      sendError(res, 'فایل ZIP آپلود نشده است', 400);
      return;
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'ANALYZING' }
    });

    // Extract ZIP file
    const extractPath = path.join(path.dirname(zipFile.path), 'extracted');
    const extractedFiles = await extractZipFile(zipFile.path, extractPath);

    const uploadedFiles: any[] = [];
    let totalSize = 0;

    // Process extracted files
    for (const filePath of extractedFiles) {
      try {
        const fullPath = path.join(extractPath, filePath);
        const stats = fs.statSync(fullPath);
        const fileType = getFileType(filePath);
        const extension = path.extname(filePath);
        
        totalSize += stats.size;

        // Analyze file
        let analysis = null;
        try {
          analysis = await analyzeFile(fullPath);
        } catch (error) {
          console.warn(`خطا در تحلیل فایل ${filePath}:`, error);
        }

        // Read content for small text files
        let content = null;
        if (stats.size < 500 * 1024 && 
            ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.html', '.css', '.scss', '.json', '.md', '.txt'].includes(extension)) {
          try {
            content = fs.readFileSync(fullPath, 'utf8');
          } catch (error) {
            console.warn(`خطا در خواندن محتوای فایل ${filePath}:`, error);
          }
        }

        // Create file record
        const projectFile = await prisma.projectFile.create({
          data: {
            projectId,
            path: filePath,
            originalPath: fullPath,
            name: path.basename(filePath),
            extension,
            type: fileType as any,
            size: BigInt(stats.size),
            content,
            analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
            isDirectory: false
          }
        });

        uploadedFiles.push({
          id: projectFile.id,
          name: filePath,
          size: stats.size,
          type: fileType,
          analysis: analysis
        });

      } catch (error) {
        console.error(`خطا در پردازش فایل ${filePath}:`, error);
      }
    }

    // Analyze entire project
    let projectAnalysis = null;
    try {
      projectAnalysis = await analyzeProject(extractPath);
    } catch (error) {
      console.warn('خطا در تحلیل کلی پروژه:', error);
    }

    // Update project with analysis results
    await prisma.project.update({
      where: { id: projectId },
      data: {
        filesCount: uploadedFiles.length,
        totalSize: BigInt(totalSize),
        status: 'READY',
        lastAnalyzed: new Date(),
        analysisData: projectAnalysis ? JSON.parse(JSON.stringify(projectAnalysis)) : null,
        updatedAt: new Date()
      }
    });

    // Clean up temporary files
    try {
      fs.unlinkSync(zipFile.path);
      fs.rmSync(extractPath, { recursive: true, force: true });
    } catch (error) {
      console.warn('خطا در پاک کردن فایل‌های موقت:', error);
    }

    sendSuccess(res, {
      uploadedFiles,
      totalFiles: uploadedFiles.length,
      totalSize,
      projectAnalysis,
      projectId
    }, `پروژه با ${uploadedFiles.length} فایل از ZIP استخراج و تحلیل شد`);

  } catch (error) {
    console.error('❌ Upload ZIP error:', error);
    sendError(res, 'خطا در آپلود و استخراج فایل ZIP');
  }
};

/**
 * Get project files with tree structure
 */
export const getProjectFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Get all files
    const files = await prisma.projectFile.findMany({
      where: { projectId },
      orderBy: [
        { isDirectory: 'desc' },
        { path: 'asc' }
      ],
      select: {
        id: true,
        path: true,
        name: true,
        type: true,
        size: true,
        isDirectory: true,
        analysis: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Build tree structure
    const fileTree = buildFileTree(files);

    sendSuccess(res, {
      files,
      fileTree,
      totalFiles: files.length
    }, 'ساختار فایل‌های پروژه');

  } catch (error) {
    console.error('❌ Get project files error:', error);
    sendError(res, 'خطا در دریافت فایل‌های پروژه');
  }
};

/**
 * Get single file content
 */
export const getFileContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, fileId } = req.params;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Get file
    const file = await prisma.projectFile.findFirst({
      where: { id: fileId, projectId }
    });

    if (!file) {
      sendError(res, 'فایل یافت نشد', 404);
      return;
    }

    sendSuccess(res, {
      id: file.id,
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size.toString(),
      content: file.content,
      analysis: file.analysis,
      createdAt: file.createdAt,
      updatedAt: file.updatedAt
    }, 'محتوای فایل');

  } catch (error) {
    console.error('❌ Get file content error:', error);
    sendError(res, 'خطا در دریافت محتوای فایل');
  }
};

/**
 * Delete project file
 */
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, fileId } = req.params;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Get and delete file
    const file = await prisma.projectFile.findFirst({
      where: { id: fileId, projectId }
    });

    if (!file) {
      sendError(res, 'فایل یافت نشد', 404);
      return;
    }

    await prisma.projectFile.delete({
      where: { id: fileId }
    });

    // Update project file count
    const remainingFilesCount = await prisma.projectFile.count({
      where: { projectId }
    });

    await prisma.project.update({
      where: { id: projectId },
      data: {
        filesCount: remainingFilesCount,
        updatedAt: new Date()
      }
    });

    sendSuccess(res, null, 'فایل با موفقیت حذف شد');

  } catch (error) {
    console.error('❌ Delete file error:', error);
    sendError(res, 'خطا در حذف فایل');
  }
};

/**
 * Re-analyze project files
 */
export const reAnalyzeProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      sendError(res, 'پروژه یافت نشد', 404);
      return;
    }

    // Update status to analyzing
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'ANALYZING' }
    });

    // Get all files
    const files = await prisma.projectFile.findMany({
      where: { projectId }
    });

    // Re-analyze each file
    for (const file of files) {
      if (file.originalPath && fs.existsSync(file.originalPath)) {
        try {
          const analysis = await analyzeFile(file.originalPath);
          
          await prisma.projectFile.update({
            where: { id: file.id },
            data: {
              analysis: analysis ? JSON.parse(JSON.stringify(analysis)) : null,
              updatedAt: new Date()
            }
          });
        } catch (error) {
          console.warn(`خطا در تحلیل مجدد فایل ${file.name}:`, error);
        }
      }
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'READY',
        lastAnalyzed: new Date(),
        updatedAt: new Date()
      }
    });

    sendSuccess(res, null, 'تحلیل مجدد پروژه با موفقیت انجام شد');

  } catch (error) {
    console.error('❌ Re-analyze project error:', error);
    sendError(res, 'خطا در تحلیل مجدد پروژه');
  }
};

/**
 * Build file tree structure from flat file list
 */
const buildFileTree = (files: any[]): any[] => {
  const tree: any[] = [];
  const pathMap = new Map<string, any>();

  // Sort files by path to ensure proper tree building
  files.sort((a, b) => a.path.localeCompare(b.path));

  for (const file of files) {
    const pathParts = file.path.split('/').filter(Boolean);
    let currentLevel = tree;
    let currentPath = '';

    // Build path hierarchy
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      currentPath += (currentPath ? '/' : '') + part;
      
      const isLastPart = i === pathParts.length - 1;
      
      if (isLastPart) {
        // This is the file itself
        const fileNode = {
          id: file.id,
          name: file.name,
          type: 'file',
          path: file.path,
          size: parseInt(file.size.toString()),
          fileType: file.type,
          analysis: file.analysis,
          lastModified: file.updatedAt
        };
        currentLevel.push(fileNode);
        pathMap.set(currentPath, fileNode);
      } else {
        // This is a directory
        let dirNode = pathMap.get(currentPath);
        
        if (!dirNode) {
          dirNode = {
            id: `dir_${currentPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: part,
            type: 'directory',
            path: currentPath,
            children: []
          };
          currentLevel.push(dirNode);
          pathMap.set(currentPath, dirNode);
        }
        
        currentLevel = dirNode.children;
      }
    }
  }

  return tree;
};