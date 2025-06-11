// frontend/src/pages/project/EditProjectPage.tsx
// صفحه ویرایش پروژه

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectForm from '../../components/project/ProjectForm';
import projectService, { ProjectInput, Project } from '../../services/projectService';

const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اطلاعات پروژه
  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id]);

  // دریافت اطلاعات پروژه از API
  const fetchProject = async (projectId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await projectService.getProjectById(projectId);
      setProject(response.data);
    } catch (err: any) {
      setError(err.message || 'خطا در بارگذاری اطلاعات پروژه');
      console.error('خطا در دریافت پروژه:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // بروزرسانی پروژه
  const handleUpdateProject = async (projectData: ProjectInput) => {
    if (!id) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await projectService.updateProject(id, projectData);
      // بروزرسانی اطلاعات پروژه در state
      setProject(response.data);
      // هدایت به صفحه جزئیات پروژه
      navigate(`/projects/${id}`);
    } catch (err: any) {
      setError(err.message || 'خطا در بروزرسانی پروژه');
      console.error('خطا در بروزرسانی پروژه:', err);
      setIsSaving(false);
    }
  };

  // نمایش لودینگ هنگام بارگذاری اطلاعات پروژه
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
        </div>
      </div>
    );
  }

  // اگر پروژه پیدا نشد
  if (!project && !isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>پروژه مورد نظر یافت نشد یا شما دسترسی به آن ندارید.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">ویرایش پروژه</h1>
        
        {/* نمایش پیام خطا */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* فرم ویرایش پروژه */}
        {project && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ProjectForm
              initialData={{
                name: project.name,
                description: project.description || undefined,
                path: project.path || undefined,
              }}
              onSubmit={handleUpdateProject}
              isLoading={isSaving}
              buttonText="ذخیره تغییرات"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProjectPage; 