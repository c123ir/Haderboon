// frontend/src/pages/NewProjectPage.tsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudArrowUpIcon,
  FolderIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
}

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || getFileType(file.name),
      file,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'jsx': 'React JSX',
      'tsx': 'React TSX',
      'vue': 'Vue.js',
      'py': 'Python',
      'java': 'Java',
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'json': 'JSON',
      'md': 'Markdown',
      'txt': 'Text',
    };
    return typeMap[extension || ''] || 'Unknown';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      alert('لطفاً نام پروژه را وارد کنید');
      return;
    }
    
    if (uploadedFiles.length === 0) {
      alert('لطفاً حداقل یک فایل آپلود کنید');
      return;
    }

    setIsUploading(true);
    
    // Simulate upload process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to the new project (in real app, use the returned project ID)
      navigate('/projects/1');
    } catch (error) {
      alert('خطا در ایجاد پروژه');
    } finally {
      setIsUploading(false);
    }
  };

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">پروژه جدید</h1>
        <p className="text-white/60 mt-2">
          پروژه خود را آپلود کنید تا هادربون شروع به تحلیل کند
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Info */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold text-white mb-6">اطلاعات پروژه</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                نام پروژه *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="مثال: فروشگاه آنلاین ماهان"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                توضیحات (اختیاری)
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="توضیح کوتاهی از پروژه و اهداف آن..."
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold text-white mb-6">آپلود فایل‌ها</h2>
          
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
              dragActive
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-white/30 hover:border-white/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CloudArrowUpIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              فایل‌های پروژه را اینجا بکشید
            </h3>
            <p className="text-white/60 mb-4">
              یا روی دکمه زیر کلیک کنید تا فایل‌ها را انتخاب کنید
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <FolderIcon className="w-4 h-4 ml-2" />
              انتخاب فایل‌ها
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".js,.ts,.jsx,.tsx,.vue,.py,.java,.html,.css,.scss,.json,.md,.txt"
            />
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  فایل‌های انتخاب شده ({uploadedFiles.length})
                </h3>
                <span className="text-sm text-white/60">
                  حجم کل: {formatFileSize(totalSize)}
                </span>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex items-center flex-1">
                      <DocumentIcon className="w-5 h-5 text-blue-400 ml-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {file.name}
                        </p>
                        <p className="text-white/60 text-sm">
                          {file.type} • {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="flex items-start p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 ml-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-yellow-300 font-medium mb-1">نکته مهم:</p>
            <p className="text-yellow-200/80">
              فقط فایل‌های کد و مستندات پروژه را آپلود کنید. فایل‌های حساس مانند کلیدهای API، رمزهای عبور و اطلاعات شخصی را آپلود نکنید.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-200"
          >
            انصراف
          </button>
          
          <button
            type="submit"
            disabled={isUploading || !projectName.trim() || uploadedFiles.length === 0}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 ml-2" />
                ایجاد پروژه
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold text-white mb-4">نکات مفید:</h3>
        <ul className="space-y-2 text-white/70">
          <li className="flex items-start">
            <span className="text-blue-400 ml-2">•</span>
            فایل‌های پشتیبانی شده: JavaScript, TypeScript, React, Vue, Python, Java, HTML, CSS و...
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 ml-2">•</span>
            بهتر است کل پوشه پروژه را به صورت zip آپلود کنید
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 ml-2">•</span>
            هادربون به صورت خودکار ساختار پروژه را تشخیص می‌دهد
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 ml-2">•</span>
            پس از ایجاد، می‌توانید با دستیار چت کنید تا مستندات را بهبود دهید
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NewProjectPage;