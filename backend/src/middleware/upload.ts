// backend/src/middleware/upload.ts

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { generateUniqueFilename, ensureDirectoryExists, shouldIgnoreFile } from '../utils';
import { FILE_CONSTRAINTS } from '../types';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
ensureDirectoryExists(uploadDir);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Create project-specific directory
    const projectId = req.body.projectId || 'temp';
    const projectDir = path.join(uploadDir, projectId);
    ensureDirectoryExists(projectDir);
    cb(null, projectDir);
  },
  filename: (req: Request, file, cb) => {
    // Keep original filename for now, we'll organize later
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    // Decode filename properly
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const extension = path.extname(originalName).toLowerCase();
    
    // Check if file type is allowed
    if (FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error(`نوع فایل ${extension} پشتیبانی نمی‌شود`));
    }
  } catch (error) {
    cb(new Error('خطا در پردازش نام فایل'));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_CONSTRAINTS.MAX_FILE_SIZE, // 10MB
    files: FILE_CONSTRAINTS.MAX_FILES, // 1000 files max
  }
});

// Memory storage for single file processing
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: FILE_CONSTRAINTS.MAX_FILE_SIZE,
    files: 1
  }
});

// Multiple files upload middleware
export const uploadMultiple = upload.array('files', FILE_CONSTRAINTS.MAX_FILES);

// Single file upload middleware
export const uploadSingle = upload.single('file');

// ZIP file upload middleware for project upload with larger size limit
export const uploadProjectZip = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
      const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const extension = path.extname(originalName).toLowerCase();
      
      // Allow ZIP files specifically
      if (['.zip', '.rar', '.tar', '.gz'].includes(extension)) {
        cb(null, true);
      } else {
        cb(new Error(`نوع فایل ${extension} برای آپلود پروژه پشتیبانی نمی‌شود. فقط فایل‌های ZIP مجاز هستند.`));
      }
    } catch (error) {
      cb(new Error('خطا در پردازش نام فایل'));
    }
  },
  limits: {
    fileSize: FILE_CONSTRAINTS.MAX_ZIP_SIZE, // 200MB for ZIP files
    files: 1
  }
}).single('projectZip');

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      // Check if this is a ZIP upload endpoint
      const isZipUpload = req.path.includes('upload-zip');
      const maxSize = isZipUpload ? '200MB' : '10MB';
      
      return res.status(400).json({
        success: false,
        error: `حجم فایل بیش از حد مجاز است (حداکثر ${maxSize})`,
        code: 'FILE_TOO_LARGE'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'تعداد فایل‌ها بیش از حد مجاز است (حداکثر 1000 فایل)',
        code: 'TOO_MANY_FILES'
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        error: 'فیلد فایل نامعتبر است',
        code: 'INVALID_FIELD'
      });
    }
  }
  
  // Custom file filter errors
  if (error.message.includes('پشتیبانی نمی‌شود')) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: 'UNSUPPORTED_FILE_TYPE'
    });
  }
  
  // Generic upload error
  return res.status(500).json({
    success: false,
    error: 'خطا در آپلود فایل',
    code: 'UPLOAD_ERROR'
  });
};

// Modern ZIP extraction using Node.js built-in and stream-zip
import { createReadStream } from 'fs';
import StreamZip from 'node-stream-zip';

export const extractZipFile = async (zipPath: string, extractPath: string): Promise<string[]> => {
  try {
    console.log(`🔍 شروع استخراج فایل ZIP: ${zipPath}`);
    console.log(`📁 مسیر استخراج: ${extractPath}`);
    
    // Ensure extract directory exists
    ensureDirectoryExists(extractPath);
    
    const extractedFiles: string[] = [];
    
    // Use modern stream-zip library for better performance and reliability
    const zip = new StreamZip.async({ file: zipPath });
    
    console.log(`📊 تعداد کل فایل‌ها در ZIP: ${zip.entriesCount}`);
    
    // Get all entries
    const entries = await zip.entries();
    
    for (const entry of Object.values(entries)) {
      try {
        // Skip directories and ignored files
        if (entry.isDirectory || shouldIgnoreFile(entry.name)) {
          console.log(`⏭️ رد شدن فایل: ${entry.name} (${entry.isDirectory ? 'دایرکتوری' : 'نادیده گرفته شده'})`);
          continue;
        }
        
        // Sanitize entry name for safe file paths
        const sanitizedName = entry.name.replace(/\.\./g, '').replace(/^\/+/, '');
        const outputPath = path.join(extractPath, sanitizedName);
        const outputDir = path.dirname(outputPath);
        
        console.log(`📤 استخراج فایل: ${entry.name} -> ${outputPath}`);
        
        // Ensure directory exists
        ensureDirectoryExists(outputDir);
        
        // Extract file
        const data = await zip.entryData(entry.name);
        fs.writeFileSync(outputPath, data);
        
        extractedFiles.push(sanitizedName);
        console.log(`✅ فایل استخراج شد: ${sanitizedName} (${entry.size} bytes)`);
        
      } catch (entryError) {
        console.error(`❌ خطا در استخراج فایل ${entry.name}:`, entryError);
        // Continue with other files
      }
    }
    
    await zip.close();
    
    console.log(`🎉 استخراج کامل شد. تعداد فایل‌های استخراج شده: ${extractedFiles.length}`);
    return extractedFiles;
    
  } catch (error) {
    console.error('❌ خطا در استخراج فایل ZIP:', error);
    throw new Error(`خطا در استخراج فایل ZIP: ${error instanceof Error ? error.message : 'نامشخص'}`);
  }
};