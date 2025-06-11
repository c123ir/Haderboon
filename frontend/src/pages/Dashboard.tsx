// frontend/src/pages/Dashboard.tsx
// این فایل شامل صفحه داشبورد کاربران است

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import projectService from '../services/projectService';

// صفحه داشبورد
const Dashboard: React.FC = () => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState<boolean>(true);

  // هدایت به صفحه ورود اگر کاربر احراز هویت نشده است
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // بارگذاری اطلاعات پروژه‌ها
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const fetchProjects = async () => {
        try {
          setIsLoadingProjects(true);
          const response = await projectService.getAllProjects();
          setProjects(response.data || []);
        } catch (error) {
          console.error('خطا در بارگذاری پروژه‌ها:', error);
        } finally {
          setIsLoadingProjects(false);
        }
      };

      fetchProjects();
    }
  }, [isAuthenticated, loading]);

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
            از طریق کارت‌های زیر می‌توانید به بخش‌های مختلف ایجنت هادربون دسترسی داشته باشید.
          </p>
          
          {/* کارت‌های دسترسی سریع */}
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-semibold text-right text-gray-800 font-vazirmatn">دسترسی سریع</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* کارت پروژه‌ها */}
              <Link to="/projects" className="block p-6 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
                <h4 className="mb-2 text-lg font-semibold text-right text-gray-800 font-vazirmatn">پروژه‌های من</h4>
                <p className="text-right text-gray-600 font-vazirmatn">مدیریت پروژه‌های خود، ایجاد پروژه جدید و مشاهده جزئیات پروژه‌ها</p>
                <div className="flex justify-end mt-4">
                  <span className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-full">مشاهده پروژه‌ها</span>
                </div>
              </Link>
              
              {/* کارت مستندات */}
              {projects.length > 0 ? (
                <Link to={`/projects/${projects[0].id}/documents`} className="block p-6 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
                  <h4 className="mb-2 text-lg font-semibold text-right text-gray-800 font-vazirmatn">مستندات</h4>
                  <p className="text-right text-gray-600 font-vazirmatn">مدیریت مستندات پروژه‌ها، ایجاد و ویرایش مستندات</p>
                  <div className="flex justify-end mt-4">
                    <span className="px-3 py-1 text-xs text-white bg-green-600 rounded-full">مشاهده مستندات</span>
                  </div>
                </Link>
              ) : (
                <Link to="/projects" className="block p-6 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
                  <h4 className="mb-2 text-lg font-semibold text-right text-gray-800 font-vazirmatn">مستندات</h4>
                  <p className="text-right text-gray-600 font-vazirmatn">برای مشاهده مستندات ابتدا یک پروژه ایجاد کنید</p>
                  <div className="flex justify-end mt-4">
                    <span className="px-3 py-1 text-xs text-white bg-green-600 rounded-full">ایجاد پروژه</span>
                  </div>
                </Link>
              )}
              
              <div className="block p-6 transition-shadow bg-white border rounded-lg shadow-sm opacity-50">
                <h4 className="mb-2 text-lg font-semibold text-right text-gray-800 font-vazirmatn">چت هوشمند</h4>
                <p className="text-right text-gray-600 font-vazirmatn">گفتگو با ایجنت هوشمند هادربون (به زودی)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 