// frontend/src/services/api.ts
// این فایل شامل توابع مربوذذ به ارتباط با API بک‌اند است

import axios from 'axios';
import { LoginUserInput, RegisterUserInput } from '../types'; // تغییر مسیر

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
  } else {
    delete api.defaults.headers.common['Authorization'];
    // حذف توکن از localStorage
    localStorage.removeItem('token');
  }
};

// بررسی و تنظیم توکن در هنگام بارگذاری اپلیکیشن
export const loadToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    return token;
  }
  return null;
};

// درخواست‌های API برای احراز هویت

// ثبت‌نام کاربر جدید
export const register = async (userData: RegisterUserInput) => {
  const { confirmPassword, ...registerData } = userData; // حذف confirmPassword از داده‌های ارسالی
  const response = await api.post('/auth/register', registerData);
  return response.data;
};

// ورود کاربر
export const login = async (userData: LoginUserInput) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

// دریافت اطلاعات کاربر فعلی
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
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