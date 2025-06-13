// Frontend: frontend/src/pages/Projects.tsx
// صفحه مدیریت پروژه‌ها

import React, { useState, useContext } from 'react';
import { ThemeContext } from '../contexts';
import { ProjectCard } from '../components/project/ProjectCard';
import { ActionButton } from '../components/common/ActionButton';

const Projects = () => {
  const { darkMode } = useContext(ThemeContext);
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'فروشگاه آنلاین',
      description: 'پلتفرم فروشگاه آنلاین با React و Node.js',
      status: 'active',
      progress: 85,
      documents: 12,
      icon: '🛒',
      color: 'from-green-400 to-blue-400'
    },
    {
      id: 2,
      name: 'اپلیکیشن موبایل',
      description: 'اپلیکیشن کراس پلتفرم با React Native',
      status: 'development',
      progress: 60,
      documents: 8,
      icon: '📱',
      color: 'from-purple-400 to-pink-400'
    },
    {
      id: 3,
      name: 'سیستم مدیریت',
      description: 'سیستم جامع مدیریت کسب و کار',
      status: 'planning',
      progress: 20,
      documents: 3,
      icon: '💼',
      color: 'from-yellow-400 to-orange-400'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
          <div>
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              پروژه‌های شما
            </h2>
            <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
              مدیریت و نظارت بر پروژه‌های فعال
            </p>
          </div>
          <ActionButton primary>
            ➕ پروژه جدید
          </ActionButton>
        </div>
        
        {/* Search and Filter */}
        <div className={`rounded-2xl p-6 mb-8 backdrop-blur-lg border ${
          darkMode 
            ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
            : 'bg-white bg-opacity-70 border-gray-200'
        }`}>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:space-x-reverse">
            <div className="flex-1">
              <input
                type="text"
                placeholder="جستجو در پروژه‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  darkMode 
                    ? 'bg-white bg-opacity-15 text-white placeholder-purple-200' 
                    : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'
                }`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                darkMode 
                  ? 'bg-white bg-opacity-15 text-white' 
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="development">در حال توسعه</option>
              <option value="planning">برنامه‌ریزی</option>
            </select>
          </div>
        </div>
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              پروژه‌ای یافت نشد
            </h3>
            <p className={darkMode ? 'text-purple-200' : 'text-gray-600'}>
              {searchTerm ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'هنوز پروژه‌ای ایجاد نکرده‌اید'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;