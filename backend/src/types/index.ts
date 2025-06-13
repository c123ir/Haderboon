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
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB for regular files
  MAX_ZIP_SIZE: 200 * 1024 * 1024, // 200MB for ZIP files
  MAX_FILES: 1000,
  ALLOWED_EXTENSIONS: [
    // Programming languages
    '.js', '.ts', '.jsx', '.tsx', '.vue', '.mjs', '.cjs',
    '.py', '.pyw', '.java', '.class', '.jar',
    '.php', '.php3', '.php4', '.php5', '.phtml',
    '.rb', '.rbw', '.gem', '.rake',
    '.go', '.mod', '.sum',
    '.c', '.h', '.cpp', '.cc', '.cxx', '.hpp',
    '.cs', '.vb', '.fs', '.fsx',
    '.swift', '.kt', '.kts',
    '.rs', '.toml',
    '.scala', '.sc',
    '.clj', '.cljs', '.cljc',
    '.dart',
    '.r', '.R', '.rmd',
    '.sql', '.sqlite', '.db',
    '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
    
    // Web and markup
    '.html', '.htm', '.xhtml',
    '.css', '.scss', '.sass', '.less', '.styl',
    '.js', '.ts', '.jsx', '.tsx',
    '.xml', '.xsl', '.xslt',
    '.json', '.jsonc', '.json5',
    '.yaml', '.yml',
    '.toml', '.ini', '.cfg', '.conf',
    '.env', '.env.local', '.env.development', '.env.production',
    
    // Documentation and text
    '.md', '.markdown', '.mdown', '.mkd',
    '.txt', '.text', '.rtf',
    '.doc', '.docx', '.odt',
    '.pdf',
    '.tex', '.latex',
    '.rst', '.asciidoc', '.org',
    
    // Images and media
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
    '.ico', '.icns', '.bmp', '.tiff', '.tif',
    '.mp4', '.avi', '.mov', '.wmv', '.flv',
    '.mp3', '.wav', '.flac', '.aac', '.ogg',
    
    // Archives and packages
    '.zip', '.rar', '.tar', '.gz', '.bz2', '.xz',
    '.7z', '.dmg', '.iso',
    
    // Configuration and data
    '.properties', '.plist', '.xcconfig',
    '.gradle', '.maven', '.sbt',
    '.cmake', '.make', '.makefile',
    '.dockerfile', '.docker-compose.yml',
    '.gitignore', '.gitattributes', '.gitmodules',
    '.editorconfig', '.prettierrc', '.eslintrc',
    '.babelrc', '.tslint.json', '.tsconfig.json',
    '.package.json', '.package-lock.json', '.yarn.lock',
    '.composer.json', '.requirements.txt', '.pipfile',
    '.gemfile', '.podfile', '.cartfile',
    
    // Others
    '.log', '.out', '.err',
    '.lock', '.pid', '.tmp', '.temp',
    '.backup', '.bak', '.old',
    '.sample', '.example', '.template',
    
    // Allow files without extension
    ''
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