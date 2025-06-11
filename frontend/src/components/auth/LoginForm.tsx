// frontend/src/components/auth/LoginForm.tsx
// این فایل شامل کامپوننت فرم ورود است

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoginUserInput } from '../../types'; // تغییر مسیر

// کامپوننت فرم ورود
const LoginForm: React.FC = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // وضعیت فرم
  const [formData, setFormData] = useState<LoginUserInput>({
    email: '',
    password: '',
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
    if (!formData.email || !formData.password) {
      setLocalError('لطفاً ایمیل و پسورد را وارد کنید');
      return;
    }
    
    // ارسال اطلاعات به سرور از طریق کانتکست
    await login(formData);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800 font-vazirmatn">ورود به ایجنت هادربون</h2>
      
      {/* نمایش خطا */}
      {(localError || error) && (
        <div className="w-full p-3 mb-4 text-sm text-right text-white bg-red-500 rounded-md">
          {localError || error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
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
        
        {/* دکمه ورود */}
        <div>
          <button
            type="submit"
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ورود
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;