// frontend/src/components/auth/RegisterForm.tsx
// این فایل شامل کامپوننت فرم ثبت‌نام است

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RegisterUserInput } from '../../utils/types';

// کامپوننت فرم ثبت‌نام
const RegisterForm: React.FC = () => {
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // وضعیت فرم
  const [formData, setFormData] = useState<RegisterUserInput>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // پیام خطای محلی
  const [localError, setLocalError] = useState<string | null>(null);

  // هدایت به صفحه اصلی اگر کاربر قبلاً احراز هویت شده است
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // مدیریت تغییرات فیلد‌های فرم
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null); // پاک کردن خطای محلی هنگام تغییر فیلدها
    clearError(); // پاک کردن خطای کانتکست هنگام تغییر فیلدها
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // مدیریت ثبت فرم
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // اعتبارسنجی فیلدها
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('لطفاً تمامی فیلدها را پر کنید');
      return;
    }
    
    // اعتبارسنجی فرمت ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('لطفاً یک ایمیل معتبر وارد کنید');
      return;
    }
    
    // اعتبارسنجی طول پسورد
    if (formData.password.length < 6) {
      setLocalError('پسورد باید حداقل 6 کاراکتر باشد');
      return;
    }
    
    // اعتبارسنجی تطابق پسورد و تأیید پسورد
    if (formData.password !== formData.confirmPassword) {
      setLocalError('پسورد و تأیید پسورد مطابقت ندارند');
      return;
    }
    
    // ارسال اطلاعات به سرور از طریق کانتکست
    await register(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800 font-vazirmatn">ثبت‌نام در ایجنت هادربون</h2>
      
      {/* نمایش خطا */}
      {(localError || error) && (
        <div className="w-full p-3 mb-4 text-sm text-right text-white bg-red-500 rounded-md">
          {localError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {/* نام کاربری */}
        <div className="space-y-1">
          <label htmlFor="username" className="block text-sm font-medium text-right text-gray-700">
            نام کاربری
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-right border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            dir="rtl"
          />
        </div>
        
        {/* ایمیل */}
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-right text-gray-700">
            ایمیل
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-right border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            dir="ltr"
          />
        </div>
        
        {/* پسورد */}
        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-right text-gray-700">
            پسورد
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-right border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            dir="ltr"
          />
        </div>
        
        {/* تأیید پسورد */}
        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-right text-gray-700">
            تأیید پسورد
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="block w-full px-3 py-2 text-right border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            dir="ltr"
          />
        </div>
        
        {/* دکمه ثبت‌نام */}
        <div>
          <button
            type="submit"
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ثبت‌نام
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;