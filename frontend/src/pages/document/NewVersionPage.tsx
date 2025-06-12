// frontend/src/pages/document/NewVersionPage.tsx
// صفحه ایجاد نسخه جدید مستند در ایجنت هادربون

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MarkdownEditor from '../../components/document/MarkdownEditor';
import documentService from '../../services/documentService';

/**
 * صفحه ایجاد نسخه جدید مستند
 */
const NewVersionPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  
  const [document, setDocument] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [changelog, setChangelog] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // بارگذاری اطلاعات مستند
  useEffect(() => {
    const fetchDocument = async () => {
      if (!documentId) return;
      
      setIsLoadingData(true);
      setError(null);
      
      try {
        const response = await documentService.getDocumentById(documentId);
        const documentData = response.data;
        setDocument(documentData);
        
        // تنظیم محتوای اولیه با محتوای آخرین نسخه
        if (documentData.latestVersion) {
          setContent(documentData.latestVersion.content);
        }
      } catch (err: any) {
        console.error('خطا در بارگذاری مستند:', err);
        setError(err.response?.data?.message || 'خطا در بارگذاری اطلاعات مستند');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    fetchDocument();
  }, [documentId]);

  // ارسال فرم ایجاد نسخه جدید
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentId) return;
    
    // بررسی اعتبار فرم
    if (!content.trim()) {
      setError('محتوای مستند الزامی است');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // ارسال درخواست ایجاد نسخه جدید
      await documentService.createDocumentVersion(documentId, {
        content,
        changelog: changelog.trim() || undefined,
        isPublished
      });
      
      alert('نسخه جدید مستند با موفقیت ایجاد شد');
      
      // هدایت به صفحه مشاهده مستند
      navigate(`/documents/${documentId}`);
    } catch (err: any) {
      console.error('خطا در ایجاد نسخه جدید مستند:', err);
      setError(err.response?.data?.message || 'خطا در ایجاد نسخه جدید مستند');
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

  if (error && !document) {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">ایجاد نسخه جدید مستند</h1>
      {document && (
        <h2 className="text-lg text-gray-600 mb-6">
          {document.title}
        </h2>
      )}
      
      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">خطا: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* محتوای مستند */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            محتوای مستند *
          </label>
          <MarkdownEditor
            initialValue={content}
            onChange={setContent}
            height="400px"
          />
        </div>
        
        {/* توضیحات تغییرات */}
        <div>
          <label htmlFor="changelog" className="block text-sm font-medium text-gray-700">
            توضیحات تغییرات (اختیاری)
          </label>
          <textarea
            id="changelog"
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            placeholder="توضیح دهید چه تغییراتی در این نسخه اعمال شده است"
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {/* وضعیت انتشار */}
        <div className="flex items-center">
          <input
            id="isPublished"
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublished" className="mr-2 block text-sm text-gray-700">
            منتشر شود
          </label>
        </div>
        
        {/* دکمه‌های عملیات */}
        <div className="flex justify-end space-x-2 space-x-reverse">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => navigate(-1)}
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'در حال پردازش...' : 'ایجاد نسخه جدید'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewVersionPage; 