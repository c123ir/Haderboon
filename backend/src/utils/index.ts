// backend/src/utils/index.ts

import { Response } from 'express';
import { ApiResponse } from '../types';
import path from 'path';
import fs from 'fs';

/**
 * Convert BigInt values to Numbers in nested objects
 */
const convertBigIntToNumber = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber);
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToNumber(value);
    }
    return converted;
  }
  
  return obj;
};

/**
 * Send standardized API response
 */
export const sendResponse = <T = any>(
  res: Response,
  statusCode: number,
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): void => {
  const response: ApiResponse<T> = {
    success,
    timestamp: new Date().toISOString(),
  };

  if (data !== undefined) response.data = convertBigIntToNumber(data);
  if (message) response.message = message;
  if (error) response.error = error;

  res.status(statusCode).json(response);
};

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  sendResponse(res, statusCode, true, data, message);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 500,
  data?: any
): void => {
  sendResponse(res, statusCode, false, data, undefined, error);
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

/**
 * Get file type based on extension
 */
export const getFileType = (filename: string): string => {
  const extension = getFileExtension(filename);
  
  const typeMap: { [key: string]: string } = {
    '.js': 'JAVASCRIPT',
    '.ts': 'TYPESCRIPT',
    '.jsx': 'REACT_JSX',
    '.tsx': 'REACT_TSX',
    '.vue': 'VUE',
    '.py': 'PYTHON',
    '.java': 'JAVA',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.sass': 'SCSS',
    '.json': 'JSON',
    '.md': 'MARKDOWN',
    '.txt': 'TEXT',
    '.png': 'IMAGE',
    '.jpg': 'IMAGE',
    '.jpeg': 'IMAGE',
    '.gif': 'IMAGE',
    '.svg': 'IMAGE',
  };

  return typeMap[extension] || 'OTHER';
};

/**
 * Check if file should be ignored
 */
export const shouldIgnoreFile = (filePath: string): boolean => {
  const ignoredPatterns = [
    'node_modules',
    '.git',
    '.env',
    'dist',
    'build',
    '.cache',
    'coverage',
    '.nyc_output',
    'logs',
    '.DS_Store',
    'Thumbs.db'
  ];

  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);

  // Check if file matches ignored patterns
  for (const pattern of ignoredPatterns) {
    if (fileName.includes(pattern) || dirName.includes(pattern)) {
      return true;
    }
  }

  // Check file size (skip very large files)
  try {
    const stats = fs.statSync(filePath);
    if (stats.size > 5 * 1024 * 1024) { // 5MB limit
      return true;
    }
  } catch (error) {
    return true;
  }

  return false;
};

/**
 * Format file size to human readable
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalName: string): string => {
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${baseName}_${timestamp}_${random}${extension}`;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Sleep function for delays
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Persian date formatter
 */
export const formatPersianDate = (date: Date): string => {
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Sanitize filename for safe storage
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Check if directory exists, create if not
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Log with Persian timestamp
 */
export const logWithTimestamp = (message: string, level: 'info' | 'warn' | 'error' = 'info'): void => {
  const timestamp = formatPersianDate(new Date());
  const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};