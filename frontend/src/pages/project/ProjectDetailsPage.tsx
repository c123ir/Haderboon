// frontend/src/pages/project/ProjectDetailsPage.tsx
// صفحه نمایش جزئیات پروژه

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectDetails from '../../components/project/ProjectDetails';
import projectService, { Project } from '../../services/projectService';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  // حذف پروژه
  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm('آیا از حذف این پروژه اطمینان دارید؟')) {
      setIsLoading(true);
      try {
        await projectService.deleteProject(id);
        // هدایت به صفحه لیست پروژه‌ها پس از حذف
        navigate('/projects');
      } catch (err: any) {
        setError(err.message || 'خطا در حذف پروژه');
        console.error('خطا در حذف پروژه:', err);
        setIsLoading(false);
      }
    }
  };

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
      {/* نمایش پیام خطا */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* نمایش جزئیات پروژه */}
      {project && (
        <ProjectDetails
          project={project}
          onDelete={handleDelete}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage; 