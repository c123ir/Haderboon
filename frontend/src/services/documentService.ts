// frontend/src/services/documentService.ts
// سرویس مدیریت مستندات در ایجنت هادربون

import axios from 'axios';
import { API_URL } from '../config/config';
import { getAuthHeader } from '../utils/auth';

/**
 * سرویس مدیریت مستندات
 */
const documentService = {
  /**
   * ایجاد مستند جدید
   * @param documentData اطلاعات مستند جدید
   */
  createDocument: async (documentData: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/documents`, 
        documentData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در ایجاد مستند:', error);
      throw error;
    }
  },

  /**
   * دریافت همه مستندات یک پروژه
   * @param projectId شناسه پروژه
   */
  getProjectDocuments: async (projectId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/documents/project/${projectId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در دریافت مستندات پروژه:', error);
      throw error;
    }
  },

  /**
   * دریافت اطلاعات یک مستند با شناسه
   * @param documentId شناسه مستند
   */
  getDocumentById: async (documentId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در دریافت مستند:', error);
      throw error;
    }
  },

  /**
   * به‌روزرسانی اطلاعات مستند
   * @param documentId شناسه مستند
   * @param documentData اطلاعات جدید مستند
   */
  updateDocument: async (documentId: string, documentData: any) => {
    try {
      const response = await axios.put(
        `${API_URL}/documents/${documentId}`,
        documentData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در به‌روزرسانی مستند:', error);
      throw error;
    }
  },

  /**
   * حذف مستند
   * @param documentId شناسه مستند
   */
  deleteDocument: async (documentId: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/documents/${documentId}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در حذف مستند:', error);
      throw error;
    }
  },

  /**
   * ایجاد نسخه جدید از مستند
   * @param documentId شناسه مستند
   * @param versionData اطلاعات نسخه جدید
   */
  createDocumentVersion: async (documentId: string, versionData: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/documents/${documentId}/versions`,
        versionData,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در ایجاد نسخه جدید مستند:', error);
      throw error;
    }
  },

  /**
   * دریافت یک نسخه مشخص از مستند
   * @param documentId شناسه مستند
   * @param versionNumber شماره نسخه
   */
  getDocumentVersion: async (documentId: string, versionNumber: number) => {
    try {
      const response = await axios.get(
        `${API_URL}/documents/${documentId}/versions/${versionNumber}`,
        { headers: getAuthHeader() }
      );
      return response.data;
    } catch (error) {
      console.error('خطا در دریافت نسخه مستند:', error);
      throw error;
    }
  }
};

export default documentService; 