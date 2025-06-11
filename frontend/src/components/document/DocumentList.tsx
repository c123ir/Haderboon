// frontend/src/components/document/DocumentList.tsx
// کامپوننت نمایش لیست مستندات در ایجنت هادربون

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface DocumentVersion {
  id: string;
  versionNumber: number;
  content: string;
  createdAt: string;
  isPublished: boolean;
}

interface DocumentItem {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  latestVersion?: DocumentVersion;
  children?: DocumentItem[];
}

interface DocumentListProps {
  documents: DocumentItem[];
  onDelete?: (id: string) => void;
  showActions?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
  projectId?: string;
}

/**
 * کامپوننت نمایش لیست مستندات
 */
const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  showActions = true,
  isLoading = false,
  emptyMessage = 'هیچ مستندی وجود ندارد',
  projectId
}) => {
  const [expandedDocuments, setExpandedDocuments] = useState<Record<string, boolean>>({});

  // تغییر وضعیت نمایش/مخفی مستندات زیرمجموعه
  const toggleDocumentExpand = (id: string) => {
    setExpandedDocuments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // رندر یک آیتم مستند
  const renderDocumentItem = (document: DocumentItem, level = 0) => {
    const hasChildren = document.children && document.children.length > 0;
    const isExpanded = expandedDocuments[document.id];
    
    return (
      <div key={document.id} className="mb-2">
        <div 
          className={`p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow ${level > 0 ? 'ml-6' : ''}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center">
                {hasChildren && (
                  <button
                    onClick={() => toggleDocumentExpand(document.id)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? '▼' : '►'}
                  </button>
                )}
                <h3 className="text-lg font-medium text-gray-900">
                  <Link 
                    to={`/documents/${document.id}`} 
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    {document.title}
                  </Link>
                </h3>
              </div>
              
              {document.description && (
                <p className="mt-1 text-sm text-gray-600">{document.description}</p>
              )}
              
              <div className="mt-2 flex flex-wrap gap-1">
                {document.tags && document.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                آخرین بروزرسانی: {new Date(document.updatedAt).toLocaleDateString('fa-IR')}
                {document.latestVersion && ` | نسخه ${document.latestVersion.versionNumber}`}
              </div>
            </div>
            
            {showActions && (
              <div className="flex space-x-2 space-x-reverse">
                <Link
                  to={`/documents/${document.id}/edit`}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ویرایش
                </Link>
                {onDelete && (
                  <button
                    onClick={() => onDelete(document.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* نمایش زیرمستندات */}
        {hasChildren && isExpanded && (
          <div className="mt-2 pr-4 border-r border-gray-200">
            {document.children!.map(child => renderDocumentItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md">
        <p className="text-gray-500">{emptyMessage}</p>
        {projectId && (
          <Link
            to={`/projects/${projectId}/documents/new`}
            className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            ایجاد مستند جدید
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map(document => renderDocumentItem(document))}
    </div>
  );
};

export default DocumentList; 