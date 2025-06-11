// frontend/src/components/document/DocumentForm.tsx
// کامپوننت فرم ایجاد و ویرایش مستندات

import React, { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';

interface DocumentFormProps {
  initialData?: {
    title?: string;
    description?: string;
    content?: string;
    tags?: string[];
    projectId?: string;
    parentId?: string;
  };
  projects?: Array<{ id: string; name: string }>;
  parentDocuments?: Array<{ id: string; title: string }>;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

/**
 * کامپوننت فرم مستندات
 */
const DocumentForm: React.FC<DocumentFormProps> = ({
  initialData = {},
  projects = [],
  parentDocuments = [],
  onSubmit,
  isLoading = false,
  isEdit = false
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [content, setContent] = useState(initialData.content || '');
  const [tags, setTags] = useState<string[]>(initialData.tags || []);
  const [projectId, setProjectId] = useState(initialData.projectId || '');
  const [parentId, setParentId] = useState(initialData.parentId || '');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // به‌روزرسانی فرم در صورت تغییر initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setContent(initialData.content || '');
      setTags(initialData.tags || []);
      setProjectId(initialData.projectId || '');
      setParentId(initialData.parentId || '');
    }
  }, [initialData]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'عنوان مستند الزامی است';
    }
    
    if (!projectId) {
      newErrors.projectId = 'انتخاب پروژه الزامی است';
    }
    
    if (!content.trim()) {
      newErrors.content = 'محتوای مستند الزامی است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ارسال فرم
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const formData = {
        title,
        description,
        content,
        tags,
        projectId,
        parentId: parentId || undefined
      };
      
      onSubmit(formData);
    }
  };

  // افزودن تگ جدید
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // حذف تگ
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // افزودن تگ با فشردن Enter
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* عنوان مستند */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          عنوان مستند *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`mt-1 block w-full p-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* توضیحات */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          توضیحات مختصر
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* انتخاب پروژه */}
      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
          پروژه *
        </label>
        <select
          id="projectId"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          disabled={isEdit}
          className={`mt-1 block w-full p-2 border ${errors.projectId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        >
          <option value="">انتخاب پروژه</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.projectId && <p className="mt-1 text-sm text-red-500">{errors.projectId}</p>}
      </div>

      {/* مستند والد */}
      <div>
        <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
          مستند والد (اختیاری)
        </label>
        <select
          id="parentId"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">بدون مستند والد</option>
          {parentDocuments.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.title}
            </option>
          ))}
        </select>
      </div>

      {/* تگ‌ها */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          تگ‌ها
        </label>
        <div className="flex mt-1">
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="تگ جدید را وارد کنید و Enter را فشار دهید"
            className="flex-grow p-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="bg-gray-100 px-4 py-2 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200"
          >
            افزودن
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-indigo-600 hover:text-indigo-900"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* ویرایشگر محتوا */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          محتوا *
        </label>
        <div className={errors.content ? 'border border-red-500 rounded-md' : ''}>
          <MarkdownEditor
            initialValue={content}
            onChange={setContent}
            height="400px"
          />
        </div>
        {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
      </div>

      {/* دکمه‌های عملیات */}
      <div className="flex justify-end space-x-2 space-x-reverse">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => window.history.back()}
        >
          انصراف
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <span>در حال پردازش...</span>
          ) : isEdit ? (
            'به‌روزرسانی مستند'
          ) : (
            'ایجاد مستند'
          )}
        </button>
      </div>
    </form>
  );
};

export default DocumentForm; 