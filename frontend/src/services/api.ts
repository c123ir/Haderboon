// frontend/src/services/api.ts

import axios from 'axios';
import { Project, ChatMessage, Documentation, GeneratedPrompt, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5550/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('haderboon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Return just the data part
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('🔑 احراز هویت منقضی شده - لطفاً مجدداً وارد شوید');
      localStorage.removeItem('haderboon_token');
      localStorage.removeItem('haderboon_user');
      // Redirect to login if needed
      console.warn('🔑 احراز هویت منقضی شده - لطفاً مجدداً وارد شوید');
    }
    
    // Return structured error
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'خطای نامشخص';
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// API methods
export const apiService = {
  // Authentication
  async demoLogin(): Promise<any> {
    const data = await api.post('/auth/demo-login') as any;
    
    // Store token and user info (data is already response.data due to interceptor)
    if (data.success && data.token) {
      localStorage.setItem('haderboon_token', data.token);
      localStorage.setItem('haderboon_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async login(email: string, password?: string): Promise<any> {
    const data = await api.post('/auth/login', { email, password }) as any;
    
    if (data.success && data.token) {
      localStorage.setItem('haderboon_token', data.token);
      localStorage.setItem('haderboon_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async register(name: string, email: string, password?: string): Promise<any> {
    const data = await api.post('/auth/register', { name, email, password }) as any;
    
    if (data.success && data.token) {
      localStorage.setItem('haderboon_token', data.token);
      localStorage.setItem('haderboon_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  async getProfile(): Promise<any> {
    return await api.get('/auth/profile');
  },

  async logout(): Promise<void> {
    localStorage.removeItem('haderboon_token');
    localStorage.removeItem('haderboon_user');
  },

  // Projects
  async getProjects(params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string; 
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    
    const query = queryParams.toString();
    return await api.get(`/projects${query ? `?${query}` : ''}`);
  },

  async getProject(id: string): Promise<any> {
    return await api.get(`/projects/${id}`);
  },

  async createProject(data: { name: string; description?: string }): Promise<any> {
    return await api.post('/projects', data);
  },

  async updateProject(id: string, data: { name?: string; description?: string }): Promise<any> {
    return await api.put(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<any> {
    return await api.delete(`/projects/${id}`);
  },

  async getProjectStats(): Promise<any> {
    return await api.get('/projects/stats');
  },

  // Files - حالا real implementation
  async uploadFiles(projectId: string, files: FileList): Promise<any> {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    return await api.post(`/files/projects/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadProjectZip(projectId: string, zipFile: File): Promise<any> {
    const formData = new FormData();
    formData.append('projectZip', zipFile);
    
    return await api.post(`/files/projects/${projectId}/upload-zip`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  async uploadLocalDirectory(projectId: string, directoryPath: string): Promise<any> {
    return await api.post(`/files/projects/${projectId}/upload-directory`, {
      directoryPath
    });
  },

  async getProjectFiles(projectId: string): Promise<any> {
    return await api.get(`/files/projects/${projectId}/files`);
  },

  async getFileContent(projectId: string, fileId: string): Promise<any> {
    return await api.get(`/files/projects/${projectId}/files/${fileId}`);
  },

  async deleteFile(projectId: string, fileId: string): Promise<any> {
    return await api.delete(`/files/projects/${projectId}/files/${fileId}`);
  },

  async reAnalyzeProject(projectId: string): Promise<any> {
    return await api.post(`/files/projects/${projectId}/reanalyze`);
  },

  // Chat (will be implemented in phase 4)
  async getChatSessions(projectId: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: [] };
  },

  async createChatSession(projectId: string, title: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: { id: 'temp', title } };
  },

  async getChatMessages(sessionId: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: [] };
  },

  async sendChatMessage(sessionId: string, content: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: { id: 'temp', content, role: 'assistant' } };
  },

  // Documentation (will be implemented later)
  async getDocumentation(projectId: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: [] };
  },

  async createDocumentation(projectId: string, data: any): Promise<any> {
    // Placeholder for now
    return { success: true, data };
  },

  async updateDocumentation(id: string, data: any): Promise<any> {
    // Placeholder for now
    return { success: true, data };
  },

  // Prompt Generation (will be implemented in phase 5)
  async generatePrompt(projectId: string, data: any): Promise<any> {
    // Placeholder for now
    return { success: true, data: { prompt: 'تولید شده...' } };
  },

  async getGeneratedPrompts(projectId: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: [] };
  },

  // Analysis (will be implemented in phase 3)
  async analyzeProject(projectId: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: { status: 'در حال تحلیل...' } };
  },

  async getAnalysisStatus(projectId: string): Promise<any> {
    // Placeholder for now
    return { success: true, data: { status: 'READY' } };
  },
};

// Helper functions
export const authHelpers = {
  isLoggedIn(): boolean {
    return !!localStorage.getItem('haderboon_token');
  },

  getCurrentUser(): any {
    const userStr = localStorage.getItem('haderboon_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('haderboon_token');
  }
};

export default apiService;