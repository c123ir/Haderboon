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