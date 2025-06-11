// frontend/src/components/project/ProjectDetails.tsx
// کامپوننت نمایش جزئیات پروژه

import React from 'react';
import { Project } from '../../services/projectService';
import { Link } from 'react-router-dom';

interface ProjectDetailsProps {
  project: Project;
  onDelete: () => void;
  isLoading: boolean;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project, onDelete, isLoading }) => {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">جزئیات پروژه</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">اطلاعات کامل پروژه و گزینه‌های مدیریت</p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Link
            to={`/projects/${project.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            ویرایش
          </Link>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            حذف
          </button>
        </div>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">نام پروژه</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{project.name}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">توضیحات</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {project.description || 'بدون توضیحات'}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">مسیر پروژه</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">
              {project.path || 'مسیر تعیین نشده'}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">تاریخ ایجاد</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(project.createdAt)}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">آخرین بروزرسانی</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDate(project.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default ProjectDetails; 