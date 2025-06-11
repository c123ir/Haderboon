// frontend/src/services/projectService.ts
// سرویس مدیریت پروژه‌ها برای فرانت‌اند

import api from './api';

export interface ProjectInput {
  name: string;
  description?: string;
  path?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  path: string | null;
  createdAt: string;
  updatedAt: string;
}

// سرویس مدیریت پروژه‌ها
const projectService = {
  /**
   * ایجاد پروژه جدید
   * @param projectData اطلاعات پروژه
   * @returns پاسخ API شامل پروژه ایجاد شده
   */
  async createProject(projectData: ProjectInput) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error: any) {
      console.error('خطا در ایجاد پروژه:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * دریافت تمام پروژه‌های کاربر
   * @returns لیست پروژه‌ها
   */
  async getAllProjects() {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error: any) {
      console.error('خطا در دریافت پروژه‌ها:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * دریافت اطلاعات یک پروژه با شناسه
   * @param id شناسه پروژه
   * @returns اطلاعات پروژه
   */
  async getProjectById(id: string) {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('خطا در دریافت پروژه:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * بروزرسانی اطلاعات یک پروژه
   * @param id شناسه پروژه
   * @param projectData اطلاعات جدید پروژه
   * @returns پاسخ API شامل پروژه بروزرسانی شده
   */
  async updateProject(id: string, projectData: Partial<ProjectInput>) {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error: any) {
      console.error('خطا در بروزرسانی پروژه:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * حذف یک پروژه
   * @param id شناسه پروژه
   * @returns پاسخ API
   */
  async deleteProject(id: string) {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('خطا در حذف پروژه:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default projectService; 