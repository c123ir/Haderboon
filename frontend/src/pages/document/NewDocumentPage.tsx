// frontend/src/pages/document/NewDocumentPage.tsx
// صفحه ایجاد مستند جدید در ایجنت هادربون

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentForm from '../../components/document/DocumentForm';
import documentService from '../../services/documentService';
import projectService from '../../services/projectService';

/**
 * صفحه ایجاد مستند جدید
 */
const NewDocumentPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState<any[]>([]);
  const [parentDocuments, setParentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اطلاعات پایه مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setError(null);
      
      try {
        // دریافت لیست پروژه‌ها
        const projectsResponse = await projectService.getAllProjects();
        setProjects(projectsResponse.data || []);
        
        // اگر شناسه پروژه در URL وجود داشت، لیست مستندات آن پروژه را بارگیری کن
        if (projectId) {
          const documentsResponse = await documentService.getProjectDocuments(projectId);
          setParentDocuments(documentsResponse.data || []);
        }
      } catch (err: any) {
        console.error('خطا در بارگذاری اطلاعات:', err);
        setError(err.response?.data?.message || 'خطا در بارگذاری اطلاعات');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [projectId]);

  // ارسال فرم ایجاد مستند
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ارسال درخواست ایجاد مستند
      const response = await documentService.createDocument({
        ...data,
        projectId: data.projectId || projectId
      });
      
      alert('مستند با موفقیت ایجاد شد');
      
      // هدایت به صفحه مشاهده مستند جدید
      navigate(`/documents/${response.data.id}`);
    } catch (err: any) {
      console.error('خطا در ایجاد مستند:', err);
      setError(err.response?.data?.message || 'خطا در ایجاد مستند');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ایجاد مستند جدید</h1>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">خطا: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <DocumentForm
        initialData={{ projectId }}
        projects={projects}
        parentDocuments={parentDocuments}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NewDocumentPage; 