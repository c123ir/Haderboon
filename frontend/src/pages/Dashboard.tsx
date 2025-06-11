// frontend/src/pages/Dashboard.tsx
// این فایل شامل صفحه داشبورد کاربران است

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// صفحه داشبورد
const Dashboard: React.FC = () => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const navigate = useNavigate();

  // هدایت به صفحه ورود اگر کاربر احراز هویت نشده است
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // مدیریت خروج از حساب کاربری
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // نمایش اسپینر در حالت بارگذاری
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-6 bg-white shadow">
        <div className="container flex items-center justify-between mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 font-vazirmatn">داشبورد ایجنت هادربون</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            خروج
          </button>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-xl font-semibold text-right text-gray-800 font-vazirmatn">خوش آمدید!</h2>
          {user && (
            <div className="p-4 text-right bg-gray-50 rounded-md">
              <p className="font-vazirmatn">
                <span className="font-semibold ml-2">نام کاربری:</span> {user.username}
              </p>
              <p className="mt-2 font-vazirmatn">
                <span className="font-semibold ml-2">ایمیل:</span> {user.email}
              </p>
              <p className="mt-2 font-vazirmatn">
                <span className="font-semibold ml-2">شناسه کاربر:</span> {user.id}
              </p>
            </div>
          )}
          <p className="mt-4 text-right text-gray-600 font-vazirmatn">
            این یک صفحه داشبورد ساده است. در نسخه‌های بعدی، قابلیت‌های بیشتری به این صفحه اضافه خواهد شد.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 