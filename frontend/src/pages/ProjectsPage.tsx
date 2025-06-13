// frontend/src/pages/ProjectsPage.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  SparklesIcon,
  TrashIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import { Project } from '../types';

const ProjectsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProjects();
        if (response.success) {
          setProjects(response.data.projects || []);
        } else {
          setError('خطا در دریافت پروژه‌ها');
        }
      } catch (error) {
        setError('خطا در دریافت پروژه‌ها');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'analyzing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'ready':
        return 'آماده';
      case 'analyzing':
        return 'در حال تحلیل';
      case 'error':
        return 'خطا';
      default:
        return 'نامشخص';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">پروژه‌ها</h1>
          <p className="text-white/60 mt-2">مدیریت و تحلیل پروژه‌های شما</p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <PlusIcon className="w-4 h-4 ml-2" />
          پروژه جدید
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="glass-card">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-white/40 absolute right-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="جستجو در پروژه‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center space-x-2 space-x-reverse text-sm text-white/60">
            <span>{filteredProjects.length} پروژه</span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-white/70">در حال بارگذاری...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-400">{error}</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-card group relative">
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FolderIcon className="w-5 h-5 text-blue-400 ml-2" />
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
                      {project.name}
                    </h3>
                  </div>
                  <p className="text-white/60 text-sm line-clamp-2">
                    {project.description || 'بدون توضیحات'}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </div>
              </div>

              {/* Project Stats */}
              <div className="flex items-center justify-between text-sm text-white/60 mb-4">
                <span>{project.filesCount} فایل</span>
                <span>
                  {project.lastAnalyzed
                    ? `آخرین تحلیل: ${new Date(project.lastAnalyzed).toLocaleDateString('fa-IR')}`
                    : 'تحلیل نشده'
                  }
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Link
                  to={`/projects/${project.id}`}
                  className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 text-center"
                >
                  مشاهده
                </Link>
                
                <Link
                  to={`/projects/${project.id}/chat`}
                  className="p-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 hover:text-green-300 rounded-lg transition-colors duration-200"
                  title="چت"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                </Link>
                
                <Link
                  to={`/projects/${project.id}/prompt`}
                  className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 hover:text-purple-300 rounded-lg transition-colors duration-200"
                  title="تولید پرامپت"
                >
                  <SparklesIcon className="w-4 h-4" />
                </Link>

                {/* More Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white/60 hover:text-white rounded-lg transition-colors duration-200"
                  >
                    <EllipsisVerticalIcon className="w-4 h-4" />
                  </button>
                  
                  {selectedProject === project.id && (
                    <div className="absolute left-0 top-full mt-1 w-48 bg-gray-800/90 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-10">
                      <button className="w-full px-4 py-2 text-right text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center transition-colors duration-200">
                        <PencilIcon className="w-4 h-4 ml-3" />
                        ویرایش
                      </button>
                      <button className="w-full px-4 py-2 text-right text-sm text-white/70 hover:text-white hover:bg-white/10 flex items-center transition-colors duration-200">
                        <DocumentTextIcon className="w-4 h-4 ml-3" />
                        مستندات
                      </button>
                      <button className="w-full px-4 py-2 text-right text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center transition-colors duration-200">
                        <TrashIcon className="w-4 h-4 ml-3" />
                        حذف
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/40">
                  ایجاد شده: {new Date(project.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card text-center py-16">
          {searchTerm ? (
            <>
              <MagnifyingGlassIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">نتیجه‌ای یافت نشد</h3>
              <p className="text-white/60 mb-4">
                پروژه‌ای با عبارت "{searchTerm}" پیدا نشد
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                پاک کردن جستجو
              </button>
            </>
          ) : (
            <>
              <FolderIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">هنوز پروژه‌ای ندارید</h3>
              <p className="text-white/60 mb-6">
                اولین پروژه خود را بسازید تا شروع کنید
              </p>
              <Link
                to="/projects/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                <PlusIcon className="w-5 h-5 ml-2" />
                ایجاد پروژه جدید
              </Link>
            </>
          )}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

export default ProjectsPage;