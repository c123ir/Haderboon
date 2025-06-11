// frontend/src/components/project/ProjectList.tsx
// کامپوننت نمایش لیست پروژه‌ها

import React from 'react';
import { Project } from '../../services/projectService';
import { Link } from 'react-router-dom';

interface ProjectListProps {
  projects: Project[];
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onDelete, isLoading }) => {
  // فرمت کردن تاریخ به شکل خوانا
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // اگر در حال بارگذاری است
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  // اگر پروژه‌ای وجود نداشت
  if (projects.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-600">هیچ پروژه‌ای یافت نشد</h3>
        <p className="mt-2 text-gray-500">برای شروع، یک پروژه جدید ایجاد کنید.</p>
        <Link
          to="/projects/new"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          ایجاد پروژه جدید
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {projects.map((project) => (
          <li key={project.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <Link
                    to={`/projects/${project.id}`}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    {project.name}
                  </Link>
                </div>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Link
                    to={`/projects/${project.id}/edit`}
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                  >
                    ویرایش
                  </Link>
                  <button
                    onClick={() => onDelete(project.id)}
                    className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                  >
                    حذف
                  </button>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="text-sm text-gray-500 truncate">
                    {project.description || 'بدون توضیحات'}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                  <p>
                    بروزرسانی: {formatDate(project.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList; 