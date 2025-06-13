// backend/src/types/index.ts

import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Extended Request interface for authenticated routes
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
}

// File analysis results
export interface FileAnalysisResult {
  functions?: string[];
  classes?: string[];
  imports?: string[];
  exports?: string[];
  dependencies?: string[];
  complexity?: number;
  lines?: number;
  summary?: string;
  language?: string;
  framework?: string;
}

// Project analysis results
export interface ProjectAnalysisResult {
  totalFiles: number;
  totalSize: number;
  languages: { [key: string]: number };
  frameworks: string[];
  structure: {
    directories: number;
    files: number;
    depth: number;
  };
  complexity: {
    average: number;
    total: number;
    distribution: { [key: string]: number };
  };
  dependencies: {
    external: string[];
    internal: string[];
    devDependencies: string[];
  };
  summary: string;
  suggestions: string[];
}

// Upload file info
export interface UploadedFileInfo {
  originalname: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  buffer?: Buffer;
}

// Chat context for AI
export interface ChatContext {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  recentFiles: Array<{
    path: string;
    type: string;
    summary?: string;
  }>;
  conversation: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}

// Prompt generation request
export interface PromptGenerationRequest {
  requirement: string;
  includeFiles?: string[];
  excludeFiles?: string[];
  focusAreas?: string[];
  outputType?: 'code' | 'documentation' | 'analysis' | 'other';
  additionalContext?: string;
}

// JWT Payload
export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  name: string;
}

// Environment variables
export interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  GEMINI_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
  OPENAI_API_KEY?: string;
  FRONTEND_URL: string;
  MAX_FILE_SIZE: string;
  UPLOAD_DIR: string;
}

// Error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// File upload constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 1000,
  ALLOWED_EXTENSIONS: [
    '.js', '.ts', '.jsx', '.tsx', '.vue',
    '.py', '.java', '.php', '.rb', '.go',
    '.html', '.css', '.scss', '.sass', '.less',
    '.json', '.xml', '.yaml', '.yml',
    '.md', '.txt', '.doc', '.docx',
    '.png', '.jpg', '.jpeg', '.gif', '.svg',
    '.pdf'
  ],
  IGNORED_PATTERNS: [
    'node_modules',
    '.git',
    '.env',
    'dist',
    'build',
    '.cache',
    'coverage',
    '.nyc_output',
    'logs',
    '*.log'
  ]
};

// AI Model configurations
export const AI_CONFIGS = {
  GEMINI: {
    MODEL: 'gemini-pro',
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
  },
  OPENAI: {
    MODEL: 'gpt-4',
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
  },
  CLAUDE: {
    MODEL: 'claude-3-sonnet-20240229',
    MAX_TOKENS: 2048,
    TEMPERATURE: 0.7,
  }
};