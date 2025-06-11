// frontend/src/pages/document/ProjectDocumentsPage.tsx
// صفحه نمایش مستندات یک پروژه در ایجنت هادربون

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DocumentList from '../../components/document/DocumentList';
import documentService from '../../services/documentService';
import projectService from '../../services/projectService';

/**
 * صفحه نمایش مستندات یک پروژه
 */
const ProjectDocumentsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اطلاعات پروژه و مستندات آن
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // دریافت اطلاعات پروژه
        const projectResponse = await projectService.getProjectById(projectId);
        setProject(projectResponse.data);
        
        // دریافت مستندات پروژه
        const documentsResponse = await documentService.getProjectDocuments(projectId);
        setDocuments(documentsResponse.data || []);
      } catch (err: any) {
        console.error('خطا در بارگذاری مستندات پروژه:', err);
        setError(err.response?.data?.message || 'خطا در بارگذاری اطلاعات');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);

  // حذف مستند
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('آیا از حذف این مستند اطمینان دارید؟')) {
      return;
    }
    
    try {
      await documentService.deleteDocument(documentId);
      
      // به‌روزرسانی لیست مستندات پس از حذف
      setDocuments(prevDocuments => 
        prevDocuments.filter(doc => doc.id !== documentId)
      );
      
      alert('مستند با موفقیت حذف شد');
    } catch (err: any) {
      console.error('خطا در حذف مستند:', err);
      alert(err.response?.data?.message || 'خطا در حذف مستند');
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">خطا: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* هدر صفحه */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مستندات {project?.name || 'پروژه'}
          </h1>
          {project && (
            <p className="mt-2 text-gray-600">{project.description}</p>
          )}
        </div>
        
        {projectId && (
          <Link
            to={`/projects/${projectId}/documents/new`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            ایجاد مستند جدید
          </Link>
        )}
      </div>
      
      {/* لیست مستندات */}
      <DocumentList
        documents={documents}
        onDelete={handleDeleteDocument}
        isLoading={isLoading}
        emptyMessage="این پروژه هنوز هیچ مستندی ندارد"
        projectId={projectId}
      />
    </div>
  );
};

export default ProjectDocumentsPage; 