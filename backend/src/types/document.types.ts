// backend/src/types/document.types.ts
// تایپ‌های TypeScript برای مستندات در ایجنت هادربون

/**
 * تایپ ورودی برای ایجاد مستند جدید
 */
export interface CreateDocumentDto {
  title: string;
  description?: string;
  path?: string;
  projectId: string;
  parentId?: string;
  tags?: string[];
  content: string;
}

/**
 * تایپ ورودی برای بروزرسانی مستند
 */
export interface UpdateDocumentDto {
  title?: string;
  description?: string;
  path?: string;
  projectId?: string;
  parentId?: string;
  tags?: string[];
}

/**
 * تایپ ورودی برای ایجاد نسخه جدید مستند
 */
export interface CreateDocumentVersionDto {
  content: string;
  documentId: string;
  changelog?: string;
  isPublished?: boolean;
}

/**
 * تایپ ورودی برای بروزرسانی نسخه مستند
 */
export interface UpdateDocumentVersionDto {
  content?: string;
  changelog?: string;
  isPublished?: boolean;
}

/**
 * تایپ خروجی برای مستند
 */
export interface DocumentResponse {
  id: string;
  title: string;
  description?: string;
  path?: string;
  projectId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  parentId?: string;
  tags?: string[];
  latestVersion?: DocumentVersionResponse;
}

/**
 * تایپ خروجی برای نسخه مستند
 */
export interface DocumentVersionResponse {
  id: string;
  versionNumber: number;
  content: string;
  documentId: string;
  authorId: string;
  createdAt: Date;
  changelog?: string;
  isPublished: boolean;
}

/**
 * تایپ خروجی برای ساختار درختی مستندات
 */
export interface DocumentTreeItem extends DocumentResponse {
  children: DocumentTreeItem[];
} 