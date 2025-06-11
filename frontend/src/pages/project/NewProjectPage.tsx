// frontend/src/pages/project/NewProjectPage.tsx
// صفحه ایجاد پروژه جدید

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/project/ProjectForm';
import projectService, { ProjectInput } from '../../services/projectService';

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ایجاد پروژه جدید
  const handleCreateProject = async (projectData: ProjectInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await projectService.createProject(projectData);
      // هدایت به صفحه جزئیات پروژه جدید
      navigate(`/projects/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || 'خطا در ایجاد پروژه');
      console.error('خطا در ایجاد پروژه:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">ایجاد پروژه جدید</h1>
        
        {/* نمایش پیام خطا */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* فرم ایجاد پروژه */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <ProjectForm
            onSubmit={handleCreateProject}
            isLoading={isLoading}
            buttonText="ایجاد پروژه"
          />
        </div>
      </div>
    </div>
  );
};

export default NewProjectPage; 