// frontend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  userId: string;
  filesCount: number;
  lastAnalyzed?: string;
  status: 'analyzing' | 'ready' | 'error';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  path: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  analysis?: FileAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface FileAnalysis {
  functions?: string[];
  classes?: string[];
  imports?: string[];
  exports?: string[];
  complexity?: number;
  lines?: number;
  summary?: string;
}

export interface Documentation {
  id: string;
  projectId: string;
  title: string;
  content: string;
  type: 'auto' | 'manual' | 'mixed';
  status: 'draft' | 'review' | 'final';
  createdAt: string;
  updatedAt: string;
}

export interface ChatSession {
  id: string;
  projectId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  createdAt: string;
}

export interface GeneratedPrompt {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  prompt: string;
  context?: any;
  createdAt: string;
}

export interface PromptRequest {
  requirement: string;
  includeFiles?: string[];
  excludeFiles?: string[];
  focusAreas?: string[];
  outputType?: 'code' | 'documentation' | 'analysis' | 'other';
}

// Navigation and UI Types
export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  current: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// File Tree Types
export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
  size?: number;
  lastModified?: string;
}

// Analysis Status
export type AnalysisStatus = 'pending' | 'analyzing' | 'completed' | 'error';

export interface ProjectAnalysis {
  id: string;
  projectId: string;
  status: AnalysisStatus;
  progress: number;
  totalFiles: number;
  processedFiles: number;
  summary?: string;
  startedAt: string;
  completedAt?: string;
}