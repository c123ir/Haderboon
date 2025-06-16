// frontend/src/services/api.ts - برطرف شده

import axios, { AxiosProgressEvent, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5550/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // 5 minutes timeout for large uploads
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('haderboon_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response.data; // Return just the data part
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('❌ Network Error:', error.message);
      return Promise.reject({
        message: 'خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
        status: 0,
        isNetworkError: true
      });
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.error('❌ Timeout Error:', error.message);
      return Promise.reject({
        message: 'زمان درخواست به پایان رسید. لطفاً مجدد تلاش کنید.',
        status: 408,
        isTimeoutError: true
      });
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('🔑 احراز هویت منقضی شده - پاک کردن اطلاعات کاربر');
      
      localStorage.removeItem('haderboon_token');
      localStorage.removeItem('haderboon_user');
      
      // Try to re-authenticate with demo login
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/demo-login`);
        const responseData = response.data;
        
        if (responseData.success && responseData.token) {
          localStorage.setItem('haderboon_token', responseData.token);
          localStorage.setItem('haderboon_user', JSON.stringify(responseData.user));
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${responseData.token}`;
          return api(originalRequest);
        }
      } catch (authError) {
        console.error('❌ Auto re-authentication failed:', authError);
      }
    }
    
    // Extract error message with better handling
    let errorMessage = 'خطای نامشخص رخ داده است';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ API Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: errorMessage
      });
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
      code: error.response?.data?.code
    });
  }
);

// Helper function for upload progress
const createUploadConfig = (onProgress?: (progress: number) => void) => ({
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  onUploadProgress: (progressEvent: AxiosProgressEvent) => {
    if (onProgress && progressEvent.total) {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(progress);
    }
  },
});

// Validation helpers
const validateFile = (file: File): { valid: boolean; error?: string } => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.com'];
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `فایل ${file.name} بیش از حد مجاز بزرگ است (حداکثر 10MB)` 
    };
  }
  
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(extension)) {
    return { 
      valid: false, 
      error: `نوع فایل ${file.name} امن نیست` 
    };
  }
  
  if (file.name.includes('node_modules/') || 
      (file as any).webkitRelativePath?.includes('node_modules/')) {
    return { 
      valid: false, 
      error: `فایل ${file.name} در node_modules قرار دارد` 
    };
  }
  
  return { valid: true };
};

const validateFileList = (files: FileList | File[]): { 
  validFiles: File[]; 
  invalidFiles: { file: File; error: string }[];
  totalSize: number;
} => {
  const fileArray = Array.from(files);
  const validFiles: File[] = [];
  const invalidFiles: { file: File; error: string }[] = [];
  let totalSize = 0;
  
  fileArray.forEach(file => {
    const validation = validateFile(file);
    if (validation.valid) {
      validFiles.push(file);
      totalSize += file.size;
    } else {
      invalidFiles.push({ file, error: validation.error! });
    }
  });
  
  return { validFiles, invalidFiles, totalSize };
};

// API response interface
interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  data?: any;
}

// API methods
export const apiService = {
  // Authentication
  async demoLogin(): Promise<any> {
    try {
      const data = await api.post('/auth/demo-login') as ApiResponse;
      
      if (data.success && data.token) {
        localStorage.setItem('haderboon_token', data.token);
        localStorage.setItem('haderboon_user', JSON.stringify(data.user));
        console.log('✅ Demo login successful');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Demo login failed:', error);
      throw error;
    }
  },

  async login(email: string, password?: string): Promise<any> {
    try {
      const data = await api.post('/auth/login', { email, password });
      
      if (data.success && data.token) {
        localStorage.setItem('haderboon_token', data.token);
        localStorage.setItem('haderboon_user', JSON.stringify(data.user));
        console.log('✅ Login successful');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  async register(name: string, email: string, password?: string): Promise<any> {
    try {
      const data = await api.post('/auth/register', { name, email, password });
      
      if (data.success && data.token) {
        localStorage.setItem('haderboon_token', data.token);
        localStorage.setItem('haderboon_user', JSON.stringify(data.user));
        console.log('✅ Registration successful');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  async getProfile(): Promise<any> {
    return await api.get('/auth/profile');
  },

  async logout(): Promise<void> {
    localStorage.removeItem('haderboon_token');
    localStorage.removeItem('haderboon_user');
    console.log('✅ Logout successful');
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
    if (!id) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.get(`/projects/${id}`);
  },

  async createProject(data: { name: string; description?: string }): Promise<any> {
    if (!data.name?.trim()) {
      throw new Error('نام پروژه الزامی است');
    }
    
    return await api.post('/projects', {
      name: data.name.trim(),
      description: data.description?.trim()
    });
  },

  async updateProject(id: string, data: { name?: string; description?: string }): Promise<any> {
    if (!id) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.put(`/projects/${id}`, data);
  },

  async deleteProject(id: string): Promise<any> {
    if (!id) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.delete(`/projects/${id}`);
  },

  async getProjectStats(): Promise<any> {
    return await api.get('/projects/stats');
  },

  // Files with improved error handling and validation
  async uploadFiles(
    projectId: string, 
    files: FileList, 
    onProgress?: (progress: number) => void
  ): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    
    if (!files || files.length === 0) {
      throw new Error('هیچ فایلی انتخاب نشده است');
    }
    
    // Validate files
    const validation = validateFileList(files);
    
    if (validation.invalidFiles.length > 0) {
      const errorMessages = validation.invalidFiles.map(f => f.error).join('\n');
      throw new Error(`فایل‌های نامعتبر:\n${errorMessages}`);
    }
    
    if (validation.validFiles.length === 0) {
      throw new Error('هیچ فایل معتبری برای آپلود یافت نشد');
    }
    
    const formData = new FormData();
    validation.validFiles.forEach(file => {
      formData.append('files', file);
    });
    
    console.log(`📤 Uploading ${validation.validFiles.length} files...`);
    
    return await api.post(
      `/files/projects/${projectId}/upload`, 
      formData, 
      createUploadConfig(onProgress)
    );
  },

  async uploadProjectZip(
    projectId: string, 
    zipFile: File, 
    onProgress?: (progress: number) => void
  ): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    
    if (!zipFile) {
      throw new Error('فایل ZIP انتخاب نشده است');
    }
    
    // Validate ZIP file
    const allowedExtensions = ['.zip', '.rar', '.tar', '.gz', '.7z'];
    const extension = '.' + zipFile.name.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`نوع فایل ${extension} پشتیبانی نمی‌شود. فقط فایل‌های آرشیو مجاز هستند.`);
    }
    
    if (zipFile.size > 200 * 1024 * 1024) { // 200MB
      throw new Error('حجم فایل ZIP بیش از حد مجاز است (حداکثر 200MB)');
    }
    
    const formData = new FormData();
    formData.append('projectZip', zipFile);
    
    console.log(`📦 Uploading ZIP file: ${zipFile.name} (${(zipFile.size / 1024 / 1024).toFixed(2)}MB)`);
    
    return await api.post(
      `/files/projects/${projectId}/upload-zip`, 
      formData, 
      createUploadConfig(onProgress)
    );
  },

  async uploadLocalDirectory(
    projectId: string, 
    files: FileList, 
    directoryName: string,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    
    if (!files || files.length === 0) {
      throw new Error('هیچ فایلی در پوشه یافت نشد');
    }
    
    if (!directoryName?.trim()) {
      throw new Error('نام پوشه الزامی است');
    }
    
    // Validate files
    const validation = validateFileList(files);
    
    if (validation.validFiles.length === 0) {
      throw new Error('هیچ فایل معتبری در پوشه یافت نشد');
    }
    
    const formData = new FormData();
    formData.append('directoryName', directoryName.trim());
    
    validation.validFiles.forEach(file => {
      formData.append('files', file);
    });
    
    console.log(`📁 Uploading directory: ${directoryName} (${validation.validFiles.length} files)`);
    
    if (validation.invalidFiles.length > 0) {
      console.warn(`⚠️ Skipped ${validation.invalidFiles.length} invalid files`);
    }
    
    return await api.post(
      `/files/projects/${projectId}/upload-directory`, 
      formData, 
      createUploadConfig(onProgress)
    );
  },

  async getProjectFiles(projectId: string): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.get(`/files/projects/${projectId}/files`);
  },

  async getFileContent(projectId: string, fileId: string): Promise<any> {
    if (!projectId || !fileId) {
      throw new Error('شناسه پروژه و فایل الزامی است');
    }
    return await api.get(`/files/projects/${projectId}/files/${fileId}`);
  },

  async deleteFile(projectId: string, fileId: string): Promise<any> {
    if (!projectId || !fileId) {
      throw new Error('شناسه پروژه و فایل الزامی است');
    }
    return await api.delete(`/files/projects/${projectId}/files/${fileId}`);
  },

  async reAnalyzeProject(projectId: string): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.post(`/files/projects/${projectId}/reanalyze`);
  },

  // File watching
  async startProjectWatching(projectId: string): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.post(`/files/projects/${projectId}/start-watching`);
  },

  async stopProjectWatching(projectId: string): Promise<any> {
    if (!projectId) {
      throw new Error('شناسه پروژه الزامی است');
    }
    return await api.post(`/files/projects/${projectId}/stop-watching`);
  },

  async getWatchingStatus(): Promise<any> {
    return await api.get('/files/watching-status');
  },

  // Chat (placeholders for future implementation)
  async getChatSessions(projectId: string): Promise<any> {
    return { success: true, data: [] };
  },

  async createChatSession(projectId: string, title: string): Promise<any> {
    return { success: true, data: { id: 'temp', title } };
  },

  async getChatMessages(sessionId: string): Promise<any> {
    return { success: true, data: [] };
  },

  async sendChatMessage(sessionId: string, content: string): Promise<any> {
    return { success: true, data: { id: 'temp', content, role: 'assistant' } };
  },

  // Documentation (placeholders)
  async getDocumentation(projectId: string): Promise<any> {
    return { success: true, data: [] };
  },

  async createDocumentation(projectId: string, data: any): Promise<any> {
    return { success: true, data };
  },

  async updateDocumentation(id: string, data: any): Promise<any> {
    return { success: true, data };
  },

  // Prompt Generation (placeholders)
  async generatePrompt(projectId: string, data: any): Promise<any> {
    return { success: true, data: { prompt: 'تولید شده...' } };
  },

  async getGeneratedPrompts(projectId: string): Promise<any> {
    return { success: true, data: [] };
  },

  // Analysis (placeholders)
  async analyzeProject(projectId: string): Promise<any> {
    return { success: true, data: { status: 'در حال تحلیل...' } };
  },

  async getAnalysisStatus(projectId: string): Promise<any> {
    return { success: true, data: { status: 'READY' } };
  },
};

// Helper functions
export const authHelpers = {
  isLoggedIn(): boolean {
    const token = localStorage.getItem('haderboon_token');
    if (!token) return false;
    
    try {
      // Basic token validation (decode JWT payload)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        // Token expired
        localStorage.removeItem('haderboon_token');
        localStorage.removeItem('haderboon_user');
        return false;
      }
      
      return true;
    } catch (error) {
      // Invalid token format
      localStorage.removeItem('haderboon_token');
      localStorage.removeItem('haderboon_user');
      return false;
    }
  },

  getCurrentUser(): any {
    const userStr = localStorage.getItem('haderboon_user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      localStorage.removeItem('haderboon_user');
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('haderboon_token');
  },

  clearAuth(): void {
    localStorage.removeItem('haderboon_token');
    localStorage.removeItem('haderboon_user');
  }
};

// Utility functions
export const uploadHelpers = {
  validateFile,
  validateFileList,
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      'js': '🟨', 'ts': '🔷', 'jsx': '⚛️', 'tsx': '⚛️',
      'vue': '💚', 'py': '🐍', 'java': '☕', 'php': '🐘',
      'html': '🌐', 'css': '🎨', 'scss': '🎨', 'json': '📄',
      'md': '📝', 'txt': '📄', 'pdf': '📕', 'zip': '📦',
      'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'svg': '🖼️',
      'gif': '🖼️', 'mp4': '🎥', 'mp3': '🎵'
    };
    return iconMap[extension] || '📄';
  },

  shouldIgnoreFile(filePath: string): boolean {
    const ignoredPatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      '.cache/',
      'coverage/',
      '.nyc_output/',
      'logs/',
      'tmp/',
      'temp/',
      '__pycache__/',
      '.pytest_cache/',
      'vendor/',
      '.vendor/',
      'bower_components/',
      '.sass-cache/'
    ];
    
    return ignoredPatterns.some(pattern => filePath.includes(pattern));
  }
};

// Error handling helper
export const errorHelpers = {
  getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    if (error?.data?.error) return error.data.error;
    if (error?.data?.message) return error.data.message;
    return 'خطای نامشخص رخ داده است';
  },

  isNetworkError(error: any): boolean {
    return error?.isNetworkError || error?.status === 0;
  },

  isTimeoutError(error: any): boolean {
    return error?.isTimeoutError || error?.status === 408;
  },

  isAuthError(error: any): boolean {
    return error?.status === 401 || error?.status === 403;
  },

  isValidationError(error: any): boolean {
    return error?.status === 400 || error?.code === 'VALIDATION_ERROR';
  },

  handleApiError(error: any, customMessage?: string): never {
    const message = customMessage || this.getErrorMessage(error);
    
    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error);
    }
    
    throw new Error(message);
  }
};

// Connection status helper
export const connectionHelpers = {
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // @ts-ignore
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  async waitForConnection(maxRetries: number = 5, retryDelay: number = 2000): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      const isConnected = await this.checkConnection();
      if (isConnected) return true;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    return false;
  }
};

export default apiService;