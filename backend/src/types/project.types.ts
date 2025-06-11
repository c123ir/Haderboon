// backend/src/types/project.types.ts
// تایپ‌های مربوط به پروژه در ایجنت هادربون

// تایپ برای ایجاد پروژه جدید
export interface CreateProjectDto {
  name: string;
  description?: string;
  path?: string;
}

// تایپ برای بروزرسانی پروژه
export interface UpdateProjectDto {
  name?: string;
  description?: string;
  path?: string;
}

// تایپ برای پاسخ API پروژه
export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  path: string | null;
  createdAt: Date;
  updatedAt: Date;
} 