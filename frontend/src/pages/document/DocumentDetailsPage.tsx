// frontend/src/pages/document/DocumentDetailsPage.tsx
// صفحه نمایش جزئیات مستند در ایجنت هادربون

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DocumentDetails from '../../components/document/DocumentDetails';
import documentService from '../../services/documentService';

/**
 * صفحه نمایش جزئیات مستند
 */
const DocumentDetailsPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اطلاعات مستند
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await documentService.getDocumentById(documentId);
        setDocument(response.data);
      } catch (err: any) {
        console.error('خطا در بارگذاری مستند:', err);
        setError(err.response?.data?.message || 'خطا در بارگذاری اطلاعات مستند');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocument();
  }, [documentId]);

  // انتقال به صفحه ویرایش مستند
  const handleEdit = () => {
    navigate(`/documents/${documentId}/edit`);
  };

  // انتقال به صفحه ایجاد نسخه جدید
  const handleCreateVersion = () => {
    navigate(`/documents/${documentId}/versions/new`);
  };

  // حذف مستند
  const handleDelete = async () => {
    if (!documentId) return;
    
    if (!window.confirm('آیا از حذف این مستند اطمینان دارید؟')) {
      return;
    }
    
    try {
      await documentService.deleteDocument(documentId);
      alert('مستند با موفقیت حذف شد');
      
      // انتقال به صفحه مستندات پروژه
      if (document?.projectId) {
        navigate(`/projects/${document.projectId}/documents`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('خطا در حذف مستند:', err);
      alert(err.response?.data?.message || 'خطا در حذف مستند');
    }
  };

  if (isLoading) {
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <DocumentDetails
        document={document}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateVersion={handleCreateVersion}
      />
    </div>
  );
};

export default DocumentDetailsPage; 