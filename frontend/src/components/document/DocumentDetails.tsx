// frontend/src/components/document/DocumentDetails.tsx
// کامپوننت نمایش جزئیات مستند

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Author {
  id: string;
  username: string;
  name?: string;
}

interface DocumentVersion {
  id: string;
  versionNumber: number;
  content: string;
  createdAt: string;
  isPublished: boolean;
  author: Author;
  changelog?: string;
}

interface DocumentDetailsProps {
  document: {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    versions: DocumentVersion[];
    owner: Author;
    projectId: string;
    projectName?: string;
  };
  onCreateVersion?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * کامپوننت نمایش جزئیات مستند
 */
const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  document,
  onCreateVersion,
  onEdit,
  onDelete
}) => {
  const [selectedVersionNumber, setSelectedVersionNumber] = useState<number | undefined>(
    document.versions[0]?.versionNumber
  );

  // یافتن نسخه انتخاب شده
  const selectedVersion = document.versions.find(v => v.versionNumber === selectedVersionNumber);

  // تبدیل محتوای Markdown به HTML
  const renderMarkdown = (content: string) => {
    if (typeof window !== 'undefined') {
      try {
        const marked = require('marked');
        return { __html: marked.parse(content) };
      } catch (error) {
        console.error('خطا در پردازش Markdown:', error);
        return { __html: '<div>خطا در پردازش محتوا</div>' };
      }
    }
    return { __html: '' };
  };

  // فرمت تاریخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* هدر مستند */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
            {document.description && (
              <p className="mt-2 text-gray-600">{document.description}</p>
            )}
            
            <div className="mt-4 flex flex-wrap gap-2">
              {document.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">پروژه: </span>
                <Link 
                  to={`/projects/${document.projectId}`} 
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  {document.projectName || document.projectId}
                </Link>
              </div>
              <div>
                <span className="font-medium">ایجاد کننده: </span>
                {document.owner.name || document.owner.username}
              </div>
              <div>
                <span className="font-medium">تاریخ ایجاد: </span>
                {formatDate(document.createdAt)}
              </div>
              <div>
                <span className="font-medium">آخرین بروزرسانی: </span>
                {formatDate(document.updatedAt)}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 space-x-reverse">
            {onCreateVersion && (
              <button
                onClick={onCreateVersion}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ایجاد نسخه جدید
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                ویرایش
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                حذف
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* انتخاب نسخه */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center">
          <span className="text-sm font-medium text-gray-700 ml-2">نسخه:</span>
          <select
            value={selectedVersionNumber}
            onChange={(e) => setSelectedVersionNumber(Number(e.target.value))}
            className="p-2 border border-gray-300 rounded-md text-sm"
          >
            {document.versions.map(version => (
              <option key={version.id} value={version.versionNumber}>
                نسخه {version.versionNumber} - {formatDate(version.createdAt)}
                {version.changelog ? ` - ${version.changelog}` : ''}
              </option>
            ))}
          </select>
        </div>
        
        {selectedVersion && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">نویسنده: </span>
            {selectedVersion.author.name || selectedVersion.author.username}
            {selectedVersion.changelog && (
              <>
                <span className="font-medium mr-4">توضیحات تغییرات: </span>
                {selectedVersion.changelog}
              </>
            )}
          </div>
        )}
      </div>
      
      {/* محتوای مستند */}
      <div className="p-6">
        {selectedVersion ? (
          <div 
            className="prose prose-slate max-w-none"
            dir="auto"
            dangerouslySetInnerHTML={renderMarkdown(selectedVersion.content)}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            هیچ نسخه‌ای برای این مستند وجود ندارد
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetails; 