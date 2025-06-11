// frontend/src/components/project/ProjectForm.tsx
// کامپوننت فرم ایجاد و ویرایش پروژه

import React, { useState, useEffect } from 'react';
import { ProjectInput } from '../../services/projectService';

interface ProjectFormProps {
  initialData?: {
    name: string;
    description?: string;
    path?: string;
  };
  onSubmit: (data: ProjectInput) => void;
  isLoading: boolean;
  buttonText: string;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  buttonText
}) => {
  const [formData, setFormData] = useState<ProjectInput>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    path: initialData?.path || '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
  }>({});

  // بروزرسانی فرم در صورت تغییر initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        path: initialData.path || '',
      });
    }
  }, [initialData]);

  // بررسی اعتبار فرم
  const validateForm = (): boolean => {
    const newErrors: { name?: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'نام پروژه الزامی است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // تغییر مقادیر فیلدها
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ارسال فرم
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          نام پروژه <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="نام پروژه را وارد کنید"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          توضیحات
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="توضیحات پروژه را وارد کنید"
        />
      </div>
      
      <div>
        <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
          مسیر پروژه
        </label>
        <input
          type="text"
          id="path"
          name="path"
          value={formData.path}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="مسیر پروژه را وارد کنید (اختیاری)"
        />
      </div>
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
        >
          {isLoading ? 'در حال پردازش...' : buttonText}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm; 