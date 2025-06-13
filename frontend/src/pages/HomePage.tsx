// frontend/src/pages/HomePage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FolderIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { mockProjects } from '../utils/mockData';

const HomePage: React.FC = () => {
  const recentProjects = mockProjects.slice(0, 3);
  
  const stats = [
    {
      name: 'کل پروژه‌ها',
      value: mockProjects.length,
      icon: FolderIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'پروژه‌های فعال',
      value: mockProjects.filter(p => p.status === 'ready').length,
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'در حال تحلیل',
      value: mockProjects.filter(p => p.status === 'analyzing').length,
      icon: ClockIcon,
      color: 'from-yellow-500 to-yellow-600',
    },
  ];

  const quickActions = [
    {
      name: 'پروژه جدید',
      description: 'شروع تحلیل پروژه جدید',
      href: '/projects/new',
      icon: FolderIcon,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'چت هوشمند',
      description: 'گفتگو با دستیار هوشمند',
      href: '/projects',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      name: 'تولید پرامپت',
      description: 'ساخت پرامپت برای AI',
      href: '/projects',
      icon: SparklesIcon,
      color: 'from-pink-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          به هادربون خوش آمدید
        </h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">
          دستیار هوشمند برای مستندسازی خودکار پروژه‌ها و تولید پرامپت‌های بهینه برای هوش مصنوعی
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glass-card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} ml-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">عملیات سریع</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="glass-card hover:scale-105 transition-transform duration-200 group"
              >
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.name}</h3>
                  <p className="text-white/60 text-sm">{action.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">پروژه‌های اخیر</h2>
          <Link
            to="/projects"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            مشاهده همه
          </Link>
        </div>
        
        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="glass-card hover:scale-105 transition-transform duration-200 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors duration-200">
                      {project.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'ready' 
                      ? 'bg-green-500/20 text-green-400'
                      : project.status === 'analyzing'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {project.status === 'ready' ? 'آماده' : 
                     project.status === 'analyzing' ? 'در حال تحلیل' : 'خطا'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>{project.filesCount} فایل</span>
                  <span>
                    {new Date(project.updatedAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass-card text-center py-12">
            <FolderIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/60 mb-4">هنوز پروژه‌ای ندارید</p>
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <FolderIcon className="w-4 h-4 ml-2" />
              اولین پروژه را بسازید
            </Link>
          </div>
        )}
      </div>

      {/* Features Overview */}
      <div className="glass-card">
        <h2 className="text-2xl font-bold text-white mb-6">قابلیت‌های هادربون</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <DocumentTextIcon className="w-8 h-8 text-blue-400 ml-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">مستندسازی خودکار</h3>
              <p className="text-white/60">
                تحلیل خودکار کد و تولید مستندات جامع برای پروژه‌های شما
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-green-400 ml-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">چت هوشمند</h3>
              <p className="text-white/60">
                گفتگو با دستیار هوشمند درباره پروژه و دریافت راهنمایی
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <SparklesIcon className="w-8 h-8 text-purple-400 ml-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">تولید پرامپت</h3>
              <p className="text-white/60">
                ساخت پرامپت‌های بهینه برای هوش مصنوعی بر اساس نیاز شما
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <ChartBarIcon className="w-8 h-8 text-orange-400 ml-4 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">تحلیل کد</h3>
              <p className="text-white/60">
                بررسی عمیق ساختار و منطق کد برای درک بهتر پروژه
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;