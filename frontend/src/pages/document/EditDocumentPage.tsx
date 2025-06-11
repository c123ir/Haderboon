// frontend/src/pages/document/EditDocumentPage.tsx
// صفحه ویرایش مستند در ایجنت هادربون

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentForm from '../../components/document/DocumentForm';
import documentService from '../../services/documentService';
import projectService from '../../services/projectService';

/**
 * صفحه ویرایش مستند
 */
const EditDocumentPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [parentDocuments, setParentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بررسی اینکه آیا یک مستند از فرزندان مستند فعلی است (برای جلوگیری از ایجاد چرخه)
  const isDescendantOf = useCallback((doc: any, parentId: string): boolean => {
    if (!doc.children || doc.children.length === 0) {
      return false;
    }
    
    return doc.children.some((child: any) => {
      return child.id === parentId || isDescendantOf(child, parentId);
    });
  }, []);

  // بارگذاری اطلاعات پایه مورد نیاز
  useEffect(() => {
    const fetchData = async () => {
      if (!documentId) return;
      
      setIsLoadingData(true);
      setError(null);
      
      try {
        // دریافت اطلاعات مستند
        const documentResponse = await documentService.getDocumentById(documentId);
        const documentData = documentResponse.data;
        setDocument(documentData);
        
        // دریافت لیست پروژه‌ها
        const projectsResponse = await projectService.getAllProjects();
        setProjects(projectsResponse.data || []);
        
        // دریافت لیست مستندات پروژه (برای انتخاب مستند والد)
        if (documentData.projectId) {
          const documentsResponse = await documentService.getProjectDocuments(documentData.projectId);
          // حذف مستند فعلی و فرزندان آن از لیست والدین احتمالی
          const filteredDocuments = (documentsResponse.data || []).filter((doc: any) => {
            return doc.id !== documentId && !isDescendantOf(doc, documentId);
          });
          setParentDocuments(filteredDocuments);
        }
      } catch (err: any) {
        console.error('خطا در بارگذاری اطلاعات:', err);
        setError(err.response?.data?.message || 'خطا در بارگذاری اطلاعات');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchData();
  }, [documentId, isDescendantOf]);

  // ارسال فرم ویرایش مستند
  const handleSubmit = async (data: any) => {
    if (!documentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // ارسال درخواست ویرایش مستند
      await documentService.updateDocument(documentId, data);
      
      alert('مستند با موفقیت به‌روزرسانی شد');
      
      // هدایت به صفحه مشاهده مستند
      navigate(`/documents/${documentId}`);
    } catch (err: any) {
      console.error('خطا در ویرایش مستند:', err);
      setError(err.response?.data?.message || 'خطا در ویرایش مستند');
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

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">خطا: </strong>
          <span className="block sm:inline">{error || 'مستند یافت نشد'}</span>
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

  // تبدیل ساختار مستند دریافتی به فرمت مورد نیاز فرم
  const formInitialData = {
    title: document.title,
    description: document.description || '',
    content: document.latestVersion?.content || '',
    tags: document.tags || [],
    projectId: document.projectId,
    parentId: document.parentId || ''
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ویرایش مستند</h1>
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">خطا: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <DocumentForm
        initialData={formInitialData}
        projects={projects}
        parentDocuments={parentDocuments}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isEdit={true}
      />
    </div>
  );
};

export default EditDocumentPage; 