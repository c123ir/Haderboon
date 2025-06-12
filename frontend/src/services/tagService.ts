// frontend/src/services/tagService.ts
// سرویس مدیریت تگ‌ها در ایجنت هادربون

import api from './api';

/**
 * سرویس مدیریت تگ‌ها
 */
const tagService = {
  /**
   * ایجاد تگ جدید
   * @param tagData اطلاعات تگ جدید
   */
  createTag: async (tagData: { name: string; color?: string }) => {
    try {
      const response = await api.post('/tags', tagData);
      return response.data;
    } catch (error) {
      console.error('خطا در ایجاد تگ:', error);
      throw error;
    }
  },

  /**
   * دریافت همه تگ‌های کاربر
   */
  getAllTags: async () => {
    try {
      const response = await api.get('/tags');
      return response.data;
    } catch (error) {
      console.error('خطا در دریافت تگ‌ها:', error);
      throw error;
    }
  },

  /**
   * دریافت اطلاعات یک تگ با شناسه
   * @param tagId شناسه تگ
   */
  getTagById: async (tagId: string) => {
    try {
      const response = await api.get(`/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error('خطا در دریافت تگ:', error);
      throw error;
    }
  },

  /**
   * به‌روزرسانی اطلاعات تگ
   * @param tagId شناسه تگ
   * @param tagData اطلاعات جدید تگ
   */
  updateTag: async (tagId: string, tagData: { name?: string; color?: string }) => {
    try {
      const response = await api.put(`/tags/${tagId}`, tagData);
      return response.data;
    } catch (error) {
      console.error('خطا در به‌روزرسانی تگ:', error);
      throw error;
    }
  },

  /**
   * حذف تگ
   * @param tagId شناسه تگ
   */
  deleteTag: async (tagId: string) => {
    try {
      const response = await api.delete(`/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error('خطا در حذف تگ:', error);
      throw error;
    }
  },

  /**
   * اختصاص تگ به مستند
   * @param documentId شناسه مستند
   * @param tagId شناسه تگ
   */
  assignTagToDocument: async (documentId: string, tagId: string) => {
    try {
      const response = await api.post('/tags/assign', { documentId, tagId });
      return response.data;
    } catch (error) {
      console.error('خطا در اختصاص تگ به مستند:', error);
      throw error;
    }
  },

  /**
   * حذف تگ از مستند
   * @param documentId شناسه مستند
   * @param tagId شناسه تگ
   */
  removeTagFromDocument: async (documentId: string, tagId: string) => {
    try {
      const response = await api.delete(`/tags/documents/${documentId}/tags/${tagId}`);
      return response.data;
    } catch (error) {
      console.error('خطا در حذف تگ از مستند:', error);
      throw error;
    }
  },
};

export default tagService; 