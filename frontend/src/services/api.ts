// frontend/src/services/api.ts
// این فایل شامل توابع مربوذذ به ارتباط با API بک‌اند است

import axios from 'axios';
import { LoginUserInput, RegisterUserInput, Project } from '../utils/types'; // تغییر مسیر

// آدرس پایه API بک‌اند
const API_URL = 'http://localhost:5550/api/v1';

// تنظیم نمونه axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// تنظیم توکن برای تمام درخواست‌ها
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // ذخیره توکن در localStorage
    localStorage.setItem('token', token);
    console.log('توکن در localStorage ذخیره شد');
  } else {
    delete api.defaults.headers.common['Authorization'];
    // حذف توکن از localStorage
    localStorage.removeItem('token');
    console.log('توکن از localStorage حذف شد');
  }
};

// بررسی و تنظیم توکن در هنگام بارگذاری اپلیکیشن
export const loadToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // تنظیم هدر Authorization برای تمام درخواست‌های بعدی
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('توکن از localStorage بارگذاری شد:', token);
    return token;
  }
  console.log('توکن در localStorage یافت نشد');
  return null;
};

// درخواست‌های API برای احراز هویت

// ثبت‌نام کاربر جدید
export const register = async (userData: RegisterUserInput) => {
  const { confirmPassword, ...registerData } = userData; // حذف confirmPassword از داده‌های ارسالی
  const response = await api.post('/auth/register', registerData);
  
  // ذخیره توکن در صورت موفقیت‌آمیز بودن درخواست
  if (response.data && response.data.data && response.data.data.token) {
    setAuthToken(response.data.data.token);
  }
  
  return response.data;
};

// ورود کاربر
export const login = async (userData: LoginUserInput) => {
  const response = await api.post('/auth/login', userData);
  
  // ذخیره توکن در صورت موفقیت‌آمیز بودن درخواست
  if (response.data && response.data.data && response.data.data.token) {
    setAuthToken(response.data.data.token);
  }
  
  return response.data;
};

// دریافت اطلاعات کاربر فعلی
export const getCurrentUser = async () => {
  try {
    // اطمینان از تنظیم توکن قبل از درخواست
    loadToken();
    
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('خطا در دریافت اطلاعات کاربر:', error);
    throw error;
  }
};

// دریافت لیست پروژه‌ها
export const fetchProjects = async (): Promise<Project[]> => {
  // اطمینان از تنظیم توکن قبل از درخواست
  loadToken();
  
  try {
    console.log('در حال دریافت پروژه‌ها از سرور...');
    const response = await api.get('/projects');
    
    if (response.status === 200 && response.data.success) {
      console.log('پروژه‌ها با موفقیت دریافت شدند:', response.data.data);
      return response.data.data || [];
    } else {
      console.warn('پاسخ غیرمنتظره از API:', response.data);
      return [];
    }
  } catch (error) {
    console.error('خطا در دریافت پروژه‌ها:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('جزئیات خطای API:', error.response.data);
    }
    throw error;
  }
};

// ابزار بررسی وضعیت سرور
export const checkServerStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('خطا در بررسی وضعیت سرور:', error);
    throw error;
  }
};

export default api;