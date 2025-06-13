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
    const token = localStorage.getItem('token');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const apiService = {
  // Projects
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await api.get('/projects');
    return response.data;
  },

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  async createProject(data: FormData): Promise<ApiResponse<Project>> {
    const response = await api.post('/projects', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  // Files
  async getProjectFiles(projectId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/projects/${projectId}/files`);
    return response.data;
  },

  async getFileContent(projectId: string, filePath: string): Promise<ApiResponse<string>> {
    const response = await api.get(`/projects/${projectId}/files/content`, {
      params: { filePath },
    });
    return response.data;
  },

  // Chat
  async getChatSessions(projectId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get(`/projects/${projectId}/chat/sessions`);
    return response.data;
  },

  async createChatSession(projectId: string, title: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/projects/${projectId}/chat/sessions`, { title });
    return response.data;
  },

  async getChatMessages(sessionId: string): Promise<ApiResponse<ChatMessage[]>> {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
  },

  async sendChatMessage(sessionId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
    return response.data;
  },

  // Documentation
  async getDocumentation(projectId: string): Promise<ApiResponse<Documentation[]>> {
    const response = await api.get(`/projects/${projectId}/documentation`);
    return response.data;
  },

  async createDocumentation(projectId: string, data: Partial<Documentation>): Promise<ApiResponse<Documentation>> {
    const response = await api.post(`/projects/${projectId}/documentation`, data);
    return response.data;
  },

  async updateDocumentation(id: string, data: Partial<Documentation>): Promise<ApiResponse<Documentation>> {
    const response = await api.put(`/documentation/${id}`, data);
    return response.data;
  },

  // Prompt Generation
  async generatePrompt(projectId: string, data: any): Promise<ApiResponse<GeneratedPrompt>> {
    const response = await api.post(`/projects/${projectId}/prompts/generate`, data);
    return response.data;
  },

  async getGeneratedPrompts(projectId: string): Promise<ApiResponse<GeneratedPrompt[]>> {
    const response = await api.get(`/projects/${projectId}/prompts`);
    return response.data;
  },

  // Analysis
  async analyzeProject(projectId: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/projects/${projectId}/analyze`);
    return response.data;
  },

  async getAnalysisStatus(projectId: string): Promise<ApiResponse<any>> {
    const response = await api.get(`/projects/${projectId}/analysis/status`);
    return response.data;
  },
};

export default apiService;