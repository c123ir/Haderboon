import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project } from '../utils/types';
import { fetchProjects } from '../services/api';

/**
 * صفحه داشبورد کاربر
 * این صفحه پس از ورود کاربر نمایش داده می‌شود و شامل پروژه‌های کاربر و اطلاعات کلی است
 */
const Dashboard: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // بررسی وضعیت احراز هویت
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    // دریافت پروژه‌ها از سرور
    const getProjects = async () => {
      try {
        setIsLoading(true);
        const projectsData = await fetchProjects();
        setProjects(projectsData);
        setError(null);
      } catch (err) {
        setError('خطا در دریافت پروژه‌ها');
        console.error('خطا در دریافت پروژه‌ها:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      getProjects();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 font-vazirmatn">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-right">
          داشبورد هادربون
        </h1>
        
        {user && (
          <div className="bg-blue-50 p-4 rounded-md mb-6 text-right">
            <p className="text-lg text-blue-800">
              خوش آمدید، <span className="font-bold">{user.username}</span>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {user.email}
            </p>
          </div>
        )}

        {/* دسترسی سریع */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => navigate('/chat')}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 text-center"
          >
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-semibold">چت با ایجنت</span>
              <span className="text-sm opacity-90">گفتگو با هوش مصنوعی</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/projects/new')}
            className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 text-center"
          >
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="font-semibold">پروژه جدید</span>
              <span className="text-sm opacity-90">شروع پروژه جدید</span>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/documents/new')}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg hover:from-orange-600 hover:to-red-700 transition-all duration-200 text-center"
          >
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold">مستند جدید</span>
              <span className="text-sm opacity-90">ایجاد مستندات</span>
            </div>
          </button>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-right">
            پروژه‌های شما
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-700 text-right">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-600">شما هنوز پروژه‌ای ندارید</p>
              <button 
                onClick={() => navigate('/projects/new')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                ایجاد پروژه جدید
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <h3 className="font-semibold text-lg mb-2 text-right">{project.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 text-right">{project.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>آخرین بروزرسانی: {new Date(project.updatedAt).toLocaleDateString('fa-IR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 