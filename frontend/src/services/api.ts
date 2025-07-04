// services/api.ts - فایل کامل و اصلاح شده
import axios, { AxiosResponse } from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5550/api';

// ایجاد axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface برای پاسخ‌های API


// Request interceptor برای اضافه کردن token
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

// Response interceptor برای مدیریت خطاها
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('haderboon_token');
      localStorage.removeItem('haderboon_user');
      // در صورت نیاز به صفحه لاگین ریدایرکت کنید
    }
    return Promise.reject(error);
  }
);

// Auth related functions
export const authHelpers = {
  getToken: () => localStorage.getItem('haderboon_token'),
  setToken: (token: string) => localStorage.setItem('haderboon_token', token),
  removeToken: () => {
    localStorage.removeItem('haderboon_token');
    localStorage.removeItem('haderboon_user');
  },
  isAuthenticated: () => !!localStorage.getItem('haderboon_token'),
  isLoggedIn: () => !!localStorage.getItem('haderboon_token'),
  getCurrentUser: () => {
    const userStr = localStorage.getItem('haderboon_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setCurrentUser: (user: any) => {
    localStorage.setItem('haderboon_user', JSON.stringify(user));
  }
};

// API methods
const getProject = async (projectId: string) => {
  try {
    const response = await api.get(`/projects/${projectId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Get project error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت پروژه'
    };
  }
};

const getProjectFiles = async (projectId: string) => {
  try {
    const response = await api.get(`/files/projects/${projectId}/files`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Get project files error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت فایل‌ها'
    };
  }
};

const getFileContent = async (projectId: string, fileId: string) => {
  try {
    const response = await api.get(`/files/projects/${projectId}/files/${fileId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Get file content error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت محتوای فایل'
    };
  }
};

const reAnalyzeProject = async (projectId: string) => {
  try {
    const response = await api.post(`/files/projects/${projectId}/reanalyze`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Re-analyze project error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در تحلیل مجدد پروژه'
    };
  }
};

const startProjectWatching = async (projectId: string) => {
  try {
    const response = await api.post(`/files/projects/${projectId}/start-watching`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Start watching error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در شروع نظارت'
    };
  }
};

const stopProjectWatching = async (projectId: string) => {
  try {
    const response = await api.post(`/files/projects/${projectId}/stop-watching`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Stop watching error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در توقف نظارت'
    };
  }
};

const uploadFiles = async (projectId: string, files: FileList | File[]) => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(
      `/files/projects/${projectId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Upload files error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در آپلود فایل‌ها'
    };
  }
};

const uploadLocalDirectory = async (projectId: string, files: FileList | File[], directoryName: string) => {
  try {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });
    formData.append('directoryName', directoryName);

    const response = await api.post(
      `/files/projects/${projectId}/upload-directory`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Upload directory error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در آپلود پوشه'
    };
  }
};

const uploadProjectZip = async (projectId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('zipFile', file);

    const response = await api.post(
      `/files/projects/${projectId}/upload-zip`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Upload zip error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در آپلود فایل ZIP'
    };
  }
};

const createProject = async (data: { name: string; description?: string }) => {
  try {
    const response = await api.post('/projects', data);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Create project error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در ایجاد پروژه'
    };
  }
};

const getProjects = async (options?: { limit?: number }) => {
  try {
    const params = options ? new URLSearchParams() : undefined;
    if (options?.limit) {
      params?.append('limit', options.limit.toString());
    }
    
    const response = await api.get('/projects', { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Get projects error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در دریافت پروژه‌ها'
    };
  }
};

const getProjectStats = async () => {
  try {
    const response = await api.get('/projects/stats');
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Get project stats error:', error);
    return {
      success: false,
      data: {
        totalProjects: 0,
        totalFiles: 0,
        totalDocuments: 0,
        recentActivity: 0
      }
    };
  }
};

const deleteProject = async (projectId: string) => {
  try {
    const response = await api.delete(`/projects/${projectId}`);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Delete project error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'خطا در حذف پروژه'
    };
  }
};

// Demo authentication (برای تست)
const demoLogin = async () => {
  try {
    // شبیه‌سازی لاگین موفق
    const demoToken = 'demo-token-' + Date.now();
    const demoUser = { id: 'demo-user', name: 'کاربر آزمایشی', email: 'demo@haderboon.com' };
    
    authHelpers.setToken(demoToken);
    authHelpers.setCurrentUser(demoUser);
    
    return {
      success: true,
      data: { token: demoToken, user: demoUser }
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'خطا در ورود آزمایشی'
    };
  }
};

const clearStorageAndReload = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.reload();
};

// Export apiService object
export const apiService = {
  getProject,
  getProjectFiles,
  getFileContent,
  reAnalyzeProject,
  startProjectWatching,
  stopProjectWatching,
  uploadFiles,
  uploadLocalDirectory,
  uploadProjectZip,
  createProject,
  getProjects,
  getProjectStats,
  deleteProject,
  demoLogin,
  clearStorageAndReload,
  
  // Helper functions
  auth: authHelpers,
};

// Default export برای backward compatibility
export default apiService;