// frontend/src/pages/NewProjectPage.tsx - بهبود یافته

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CloudArrowUpIcon,
  FolderIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import apiService, { authHelpers } from '../services/api';
import FileSelectionModal from '../components/FileSelectionModal';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  file: File;
  status: 'pending' | 'valid' | 'invalid' | 'uploading' | 'uploaded' | 'error';
  error?: string;
}

interface UploadProgress {
  step: number;
  totalSteps: number;
  message: string;
  percentage: number;
}

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const directoryInputRef = useRef<HTMLInputElement>(null);
  
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');
  const [selectedMonitorPath, setSelectedMonitorPath] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'files' | 'directory' | 'monitor'>('files');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    step: 0,
    totalSteps: 5,
    message: '',
    percentage: 0
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [totalSize, setTotalSize] = useState(0);

  // Constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB
  const MAX_FILES = 1000;

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const loggedIn = authHelpers.isLoggedIn();
      if (!loggedIn) {
        try {
          console.log('📝 ورود خودکار در NewProjectPage...');
          await apiService.demoLogin();
          console.log('✅ ورود موفق');
        } catch (error) {
          console.error('❌ خطا در ورود خودکار:', error);
          setLoginError('خطا در ورود - لطفاً صفحه را refresh کنید');
        }
      }
    };

    checkAuth();
  }, []);

  // Calculate total size when files change
  useEffect(() => {
    const total = uploadedFiles.reduce((sum, file) => sum + file.size, 0);
    setTotalSize(total);
  }, [uploadedFiles]);

  // Helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileExtension = (fileName: string): string => {
    return fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  };

  const getFileType = (fileName: string): string => {
    const extension = getFileExtension(fileName);
    const typeMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React',
      '.tsx': 'React TS',
      '.py': 'Python',
      '.java': 'Java',
      '.php': 'PHP',
      '.html': 'HTML',
      '.css': 'CSS',
      '.json': 'JSON',
      '.xml': 'XML',
      '.md': 'Markdown',
      '.txt': 'Text',
      '.pdf': 'PDF',
      '.png': 'Image',
      '.jpg': 'Image',
      '.jpeg': 'Image',
      '.svg': 'SVG',
      '.zip': 'Archive',
      '.rar': 'Archive',
      '.env': 'Config',
      '.config': 'Config',
      '.yaml': 'YAML',
      '.yml': 'YAML'
    };
    return typeMap[extension] || 'Unknown';
  };

  // Validation functions
  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `فایل بیش از حد مجاز بزرگ است (حداکثر ${formatFileSize(MAX_FILE_SIZE)})` };
    }

    // Check if it's node_modules
    const path = file.webkitRelativePath || file.name;
    if (path.includes('node_modules/')) {
      return { valid: false, error: 'فایل‌های node_modules مجاز نیستند' };
    }

    // Check for dangerous files
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.com'];
    const extension = getFileExtension(file.name);
    if (dangerousExtensions.includes(extension)) {
      return { valid: false, error: 'نوع فایل امن نیست' };
    }

    return { valid: true };
  }, [MAX_FILE_SIZE]);

  const validateAllFiles = useCallback((files: UploadedFile[]): string[] => {
    const errors: string[] = [];

    // Check total number of files
    if (files.length > MAX_FILES) {
      errors.push(`تعداد فایل‌ها بیش از حد مجاز است (حداکثر ${MAX_FILES} فایل)`);
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      errors.push(`حجم کل فایل‌ها بیش از حد مجاز است (حداکثر ${formatFileSize(MAX_TOTAL_SIZE)})`);
    }

    // Check for duplicate files
    const filePaths = files.map(f => f.name);
    const duplicates = filePaths.filter((path, index) => filePaths.indexOf(path) !== index);
    if (duplicates.length > 0) {
      errors.push(`فایل‌های تکراری یافت شد: ${duplicates.slice(0, 3).join(', ')}${duplicates.length > 3 ? '...' : ''}`);
    }

    return errors;
  }, [MAX_TOTAL_SIZE]);

  const updateUploadProgress = (step: number, message: string) => {
    const percentage = Math.round((step / 5) * 100);
    setUploadProgress({ step, totalSteps: 5, message, percentage });
  };

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

  const handleDirectoryInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];
      let directoryPath = '';
      
      if (firstFile.webkitRelativePath) {
        directoryPath = firstFile.webkitRelativePath.split('/')[0];
      } else {
        directoryPath = 'uploaded-directory';
      }
      
      if (uploadMode === 'monitor') {
        // For monitoring mode, just get the directory path
        setSelectedMonitorPath(directoryPath);
        console.log('👁️ Monitor path selected:', directoryPath);
      } else {
        // For directory upload mode
        setSelectedDirectory(directoryPath);
        localStorage.setItem('lastSelectedDirectory', directoryPath);
        
        const fileArray = Array.from(files);
        setPendingFiles(fileArray);
        setShowFileModal(true);
      }
    }
  };

  const handleFileModalConfirm = (selectedFiles: File[]) => {
    const newFiles: UploadedFile[] = selectedFiles.map(file => {
      const validation = validateFile(file);
      return {
        name: file.webkitRelativePath || file.name,
        size: file.size,
        type: getFileType(file.name),
        file,
        status: validation.valid ? 'valid' : 'invalid',
        error: validation.error
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    const errors = validateAllFiles([...uploadedFiles, ...newFiles]);
    setValidationErrors(errors);
    setShowFileModal(false);
    setPendingFiles([]);
  };

  const handleFileModalClose = () => {
    setShowFileModal(false);
    setPendingFiles([]);
    setSelectedDirectory('');
    if (directoryInputRef.current) {
      directoryInputRef.current.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;

    const newFiles: UploadedFile[] = files.map(file => {
      const validation = validateFile(file);
      return {
        name: file.name,
        size: file.size,
        type: getFileType(file.name),
        file,
        status: validation.valid ? 'valid' : 'invalid',
        error: validation.error
      };
    });

    setUploadedFiles(prev => [...prev, ...newFiles]);
    const errors = validateAllFiles([...uploadedFiles, ...newFiles]);
    setValidationErrors(errors);
  };

  const removeFile = (index: number) => {
    if (isUploading) return;
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    const errors = validateAllFiles(newFiles);
    setValidationErrors(errors);
  };

  const retryUpload = () => {
    setIsUploading(false);
    setUploadProgress({ step: 0, totalSteps: 5, message: '', percentage: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (!projectName.trim()) {
      alert('لطفاً نام پروژه را وارد کنید');
      return;
    }

    if (uploadMode === 'monitor' && !selectedMonitorPath) {
      alert('لطفاً مسیر نظارت را انتخاب کنید');
      return;
    }

    if (uploadMode !== 'monitor' && uploadedFiles.length === 0) {
      alert('لطفاً حداقل یک فایل آپلود کنید');
      return;
    }
    
    if (uploadMode === 'directory' && !selectedDirectory && uploadedFiles.length === 0) {
      alert('لطفاً یک پوشه انتخاب کنید');
      return;
    }

    // Check for validation errors
    if (validationErrors.length > 0) {
      alert('لطفاً ابتدا خطاهای موجود را برطرف کنید');
      return;
    }

    // Check for invalid files
    const invalidFiles = uploadedFiles.filter(f => f.status === 'invalid');
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} فایل نامعتبر وجود دارد. لطفاً آنها را حذف کنید`);
      return;
    }

    setIsUploading(true);
    
    try {
      // Step 1: Create project
      updateUploadProgress(1, 'ایجاد پروژه...');
      console.log('🚀 شروع ایجاد پروژه...');
      
      const projectResponse = await apiService.createProject({
        name: projectName.trim(),
        description: projectDescription.trim() || undefined
      });

      if (!projectResponse.success) {
        throw new Error(projectResponse.error || 'خطا در ایجاد پروژه');
      }

      const projectId = projectResponse.data.id;
      console.log('✅ پروژه ایجاد شد:', projectId);

      if (uploadMode === 'monitor') {
        // For monitor mode, just create the project and start monitoring
        updateUploadProgress(5, 'تکمیل شد!');
        setTimeout(() => {
          alert('پروژه با موفقیت ایجاد شد! (حالت نظارت)');
          navigate(`/projects/${projectId}`);
        }, 1000);
        return;
      }
      
      // Step 2: Prepare files
      updateUploadProgress(2, 'آماده‌سازی فایل‌ها...');
      
      const validFiles = uploadedFiles.filter(f => f.status === 'valid');
      console.log(`📤 آماده‌سازی ${validFiles.length} فایل برای آپلود...`);
      
      // Step 3: Upload files
      updateUploadProgress(3, 'آپلود فایل‌ها...');
      
      let uploadResponse;
      
      if (uploadMode === 'directory') {
        let directoryName = selectedDirectory;
        if (!directoryName && validFiles.length > 0) {
          const firstFile = validFiles[0];
          if (firstFile.name.includes('/')) {
            directoryName = firstFile.name.split('/')[0];
          } else if (firstFile.file.webkitRelativePath) {
            directoryName = firstFile.file.webkitRelativePath.split('/')[0];
          } else {
            directoryName = 'uploaded-files';
          }
        }
        
        if (!directoryName) {
          directoryName = localStorage.getItem('lastSelectedDirectory') || 'uploaded-directory';
        }
        
        console.log('📁 آپلود پوشه:', directoryName, `(${validFiles.length} فایل)`);
        
        const fileList = validFiles.map(uf => uf.file);
        const dt = new DataTransfer();
        fileList.forEach(file => dt.items.add(file));
        
        uploadResponse = await apiService.uploadLocalDirectory(projectId, dt.files, directoryName);
      } else {
        const zipFiles = validFiles.filter(f => f.name.toLowerCase().endsWith('.zip'));
        
        if (zipFiles.length === 1 && validFiles.length === 1) {
          console.log('📦 آپلود فایل ZIP:', zipFiles[0].name);
          uploadResponse = await apiService.uploadProjectZip(projectId, zipFiles[0].file);
        } else {
          console.log('📁 آپلود فایل‌های متعدد:', validFiles.length);
          const fileList = validFiles.map(uf => uf.file);
          const dt = new DataTransfer();
          fileList.forEach(file => dt.items.add(file));
          uploadResponse = await apiService.uploadFiles(projectId, dt.files);
        }
      }
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'خطا در آپلود فایل‌ها');
      }

      console.log('✅ آپلود فایل‌ها تکمیل شد');
      
      // Step 4: Post-processing
      updateUploadProgress(4, 'پردازش نهایی...');
      
      if (uploadMode === 'directory') {
        try {
          console.log('👁️ شروع نظارت بر پروژه...');
          await apiService.startProjectWatching(projectId);
          console.log('✅ نظارت شروع شد');
        } catch (error) {
          console.warn('خطا در شروع نظارت:', error);
        }
      }

      // Step 5: Complete
      updateUploadProgress(5, 'تکمیل شد!');
      console.log('🎉 همه مراحل تکمیل شد!');
      
      // Success message
      const successMessage = uploadMode === 'directory' 
        ? 'پروژه با موفقیت ایجاد شد و نظارت بر تغییرات فعال شد!'
        : 'پروژه با موفقیت ایجاد شد!';
      
      // Wait a moment then navigate
      setTimeout(() => {
        alert(successMessage);
        navigate(`/projects/${projectId}`);
      }, 1000);
      
    } catch (error: any) {
      console.error('خطا در ایجاد پروژه:', error);
      const errorMessage = error.response?.data?.error || error.message || 'خطا در ایجاد پروژه';
      alert(errorMessage);
      setIsUploading(false);
      setUploadProgress({ step: 0, totalSteps: 5, message: '', percentage: 0 });
    }
  };

  // Show login error if exists
  if (loginError) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">خطا در احراز هویت</h2>
        <p className="text-white/60 mb-6">{loginError}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  const validFilesCount = uploadedFiles.filter(f => f.status === 'valid').length;
  const invalidFilesCount = uploadedFiles.filter(f => f.status === 'invalid').length;
  const canSubmit = !isUploading && 
                   projectName.trim() && 
                   ((uploadMode === 'monitor' && selectedMonitorPath) ||
                    (uploadMode !== 'monitor' && validFilesCount > 0)) && 
                   validationErrors.length === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
                disabled={isUploading}
                maxLength={100}
              />
              <p className="text-xs text-white/40 mt-1">
                {projectName.length}/100 کاراکتر
              </p>
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
                disabled={isUploading}
                maxLength={500}
              />
              <p className="text-xs text-white/40 mt-1">
                {projectDescription.length}/500 کاراکتر
              </p>
            </div>
          </div>
        </div>

        {/* Upload Mode Selection */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold text-white mb-6">نوع آپلود</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setUploadMode('files')}
              disabled={isUploading}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                uploadMode === 'files'
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <DocumentIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-medium text-white mb-1">فایل‌های جداگانه</h3>
              <p className="text-xs text-white/60">آپلود فایل‌های انتخابی</p>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('directory')}
              disabled={isUploading}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                uploadMode === 'directory'
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <FolderIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-medium text-white mb-1">پوشه کامل</h3>
              <p className="text-xs text-white/60">آپلود پوشه با ساختار</p>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('monitor')}
              disabled={isUploading}
              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                uploadMode === 'monitor'
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/20 bg-white/5 hover:bg-white/10'
              }`}
            >
              <EyeIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-medium text-white mb-1">نظارت زنده</h3>
              <p className="text-xs text-white/60">نظارت بر تغییرات</p>
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="glass-card">
          <h2 className="text-xl font-semibold text-white mb-6">
            {uploadMode === 'files' && 'آپلود فایل‌ها'}
            {uploadMode === 'directory' && 'انتخاب پوشه'}
            {uploadMode === 'monitor' && 'انتخاب مسیر نظارت'}
          </h2>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{uploadProgress.message}</span>
                <span className="text-white/60 text-sm">
                  مرحله {uploadProgress.step} از {uploadProgress.totalSteps}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* File/Directory Input */}
          {uploadMode === 'files' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                dragActive
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-white/30 hover:border-white/50'
              }`}
            >
              <CloudArrowUpIcon className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <p className="text-white mb-2">فایل‌ها را اینجا بکشید یا کلیک کنید</p>
              <p className="text-white/60 text-sm mb-4">
                انواع فایل: کد، تصویر، مستندات، آرشیو
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                multiple
                accept=".js,.ts,.jsx,.tsx,.py,.java,.php,.html,.css,.json,.xml,.md,.txt,.pdf,.png,.jpg,.jpeg,.svg,.zip,.rar,.env,.config,.yaml,.yml"
                className="hidden"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200"
              >
                انتخاب فایل‌ها
              </button>
            </div>
          )}

          {uploadMode === 'directory' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                <FolderIcon className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <p className="text-white mb-2">انتخاب پوشه برای آپلود</p>
                <p className="text-white/60 text-sm mb-4">
                  ساختار پوشه حفظ خواهد شد
                </p>
                <input
                  type="file"
                  ref={directoryInputRef}
                  onChange={handleDirectoryInput}
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => directoryInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  انتخاب پوشه
                </button>
              </div>

              {selectedDirectory && (
                <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <div className="flex items-center">
                    <FolderIcon className="w-5 h-5 text-blue-400 ml-3" />
                    <span className="text-white font-medium">{selectedDirectory}</span>
                    <span className="text-white/60 text-sm mr-auto">
                      {formatFileSize(totalSize)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadMode === 'monitor' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center">
                <EyeIcon className="w-12 h-12 text-white/60 mx-auto mb-4" />
                <p className="text-white mb-2">انتخاب مسیر برای نظارت</p>
                <p className="text-white/60 text-sm mb-4">
                  تغییرات به صورت زنده پیگیری می‌شود
                </p>
                <input
                  type="file"
                  ref={directoryInputRef}
                  onChange={handleDirectoryInput}
                  webkitdirectory=""
                  directory=""
                  multiple
                  className="hidden"
                  disabled={isUploading}
                />
                <button
                  type="button"
                  onClick={() => directoryInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  انتخاب مسیر
                </button>
              </div>

              {selectedMonitorPath && (
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="flex items-center">
                    <EyeIcon className="w-5 h-5 text-green-400 ml-3" />
                    <span className="text-white font-medium">{selectedMonitorPath}</span>
                    <span className="text-green-400 text-sm mr-auto">
                      آماده نظارت
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-400 ml-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-red-400 font-medium mb-2">خطاهای اعتبارسنجی:</h4>
                  <ul className="text-red-300 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  فایل‌های انتخاب شده ({uploadedFiles.length})
                </h3>
                <div className="flex items-center space-x-4 space-x-reverse text-sm">
                  {validFilesCount > 0 && (
                    <span className="text-green-400">✓ {validFilesCount} معتبر</span>
                  )}
                  {invalidFilesCount > 0 && (
                    <span className="text-red-400">✗ {invalidFilesCount} نامعتبر</span>
                  )}
                  <span className="text-white/60">
                    {formatFileSize(totalSize)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      file.status === 'valid'
                        ? 'border-green-500/30 bg-green-500/10'
                        : 'border-red-500/30 bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <DocumentIcon 
                        className={`w-5 h-5 flex-shrink-0 ml-3 ${
                          file.status === 'valid' ? 'text-green-400' : 'text-red-400'
                        }`} 
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{file.name}</p>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <p className="text-white/60 text-sm">
                            {file.type} • {formatFileSize(file.size)}
                          </p>
                          {file.error && (
                            <p className="text-red-400 text-xs">
                              {file.error}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
                        title="حذف فایل"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Summary */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{uploadedFiles.length}</p>
                  <p className="text-white/60 text-sm">کل فایل‌ها</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{validFilesCount}</p>
                  <p className="text-white/60 text-sm">معتبر</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-400">{invalidFilesCount}</p>
                  <p className="text-white/60 text-sm">نامعتبر</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{formatFileSize(totalSize)}</p>
                  <p className="text-white/60 text-sm">حجم کل</p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/60 text-sm">حجم استفاده شده</span>
                  <span className="text-white/60 text-sm">
                    {Math.round((totalSize / MAX_TOTAL_SIZE) * 100)}% از {formatFileSize(MAX_TOTAL_SIZE)}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      totalSize > MAX_TOTAL_SIZE ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((totalSize / MAX_TOTAL_SIZE) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guidelines and Tips */}
        <div className="glass-card">
          <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-400 ml-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">راهنما و نکات مهم</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-medium mb-2">✅ فایل‌های پشتیبانی شده:</h4>
                  <ul className="space-y-1 text-white/70 text-sm">
                    <li>• کدهای برنامه‌نویسی: JS, TS, Python, Java, PHP</li>
                    <li>• فایل‌های وب: HTML, CSS, JSON, XML</li>
                    <li>• مستندات: MD, TXT, PDF</li>
                    <li>• تصاویر: PNG, JPG, SVG</li>
                    <li>• پیکربندی: ENV, CONFIG, YAML</li>
                    <li>• آرشیو: ZIP, RAR</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-white font-medium mb-2">⚠️ محدودیت‌ها:</h4>
                  <ul className="space-y-1 text-white/70 text-sm">
                    <li>• حداکثر حجم هر فایل: {formatFileSize(MAX_FILE_SIZE)}</li>
                    <li>• حداکثر حجم کل: {formatFileSize(MAX_TOTAL_SIZE)}</li>
                    <li>• حداکثر تعداد فایل: {MAX_FILES.toLocaleString()}</li>
                    <li>• فایل‌های node_modules مجاز نیستند</li>
                    <li>• فایل‌های اجرایی (.exe, .bat) مجاز نیستند</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h4 className="text-blue-400 font-medium mb-2">💡 توصیه‌های بهینه‌سازی:</h4>
                <ul className="space-y-1 text-blue-300/80 text-sm">
                  <li>• پوشه‌های غیرضروری (dist, build, .git) حذف می‌شوند</li>
                  <li>• در حالت انتخاب پوشه، ساختار کامل حفظ می‌شود</li>
                  <li>• فایل‌های ZIP به صورت خودکار استخراج می‌شوند</li>
                  <li>• تحلیل کد فقط روی فایل‌های متنی انجام می‌شود</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            disabled={isUploading}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            انصراف
          </button>
          
          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex items-center px-6 py-3 rounded-lg transition-all duration-200 ${
              canSubmit
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg'
                : 'bg-gray-600 cursor-not-allowed text-gray-300'
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 ml-2" />
                ایجاد پروژه ({uploadMode === 'monitor' ? 'نظارت' : `${validFilesCount} فایل`})
              </>
            )}
          </button>
        </div>
      </form>

      {/* File Selection Modal */}
      <FileSelectionModal
        isOpen={showFileModal}
        onClose={handleFileModalClose}
        files={pendingFiles}
        directoryName={selectedDirectory}
        onConfirm={handleFileModalConfirm}
      />
    </div>
  );
};

export default NewProjectPage;