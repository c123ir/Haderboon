// frontend/src/pages/project/ProjectsListPage.tsx
// صفحه نمایش لیست پروژه‌ها

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProjectList from '../../components/project/ProjectList';
import projectService, { Project } from '../../services/projectService';

const ProjectsListPage: React.FC = () => {
  // متغیرهای state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اولیه پروژه‌ها
  useEffect(() => {
    fetchProjects();
  }, []);

  // دریافت لیست پروژه‌ها از API
  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await projectService.getAllProjects();
      setProjects(response.data);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری پروژه‌ها');
      console.error('خطا در دریافت پروژه‌ها:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // حذف پروژه
  const handleDelete = async (projectId: string) => {
    if (window.confirm('آیا از حذف این پروژه اطمینان دارید؟')) {
      setIsLoading(true);
      try {
        await projectService.deleteProject(projectId);
        // بروزرسانی لیست پروژه‌ها پس از حذف
        setProjects(projects.filter(project => project.id !== projectId));
      } catch (err: any) {
        setError(err.message || 'خطا در حذف پروژه');
        console.error('خطا در حذف پروژه:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">پروژه‌های من</h1>
        <Link
          to="/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          ایجاد پروژه جدید
        </Link>
      </div>
      
      {/* نمایش پیام خطا */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* نمایش لیست پروژه‌ها */}
      <ProjectList
        projects={projects}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProjectsListPage; 