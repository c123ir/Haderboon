import React, { useState } from 'react';
import {
  CloudArrowUpIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import FileSelectionModal from './FileSelectionModal';

interface ProjectFileManagerProps {
  projectId: string;
  onFileUpdate: () => void;
}

const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({
  projectId,
  onFileUpdate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [selectedDirectory, setSelectedDirectory] = useState<string>('');

  const handleAddFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.js,.ts,.jsx,.tsx,.vue,.py,.java,.html,.css,.scss,.json,.md,.txt';
    
    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        await uploadFiles(files);
      }
    };
    
    input.click();
  };

  const handleAddDirectory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    (input as any).webkitdirectory = true;
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const firstFile = files[0];
        const directoryPath = firstFile.webkitRelativePath.split('/')[0];
        setSelectedDirectory(directoryPath);
        setPendingFiles(files);
        setShowFileModal(true);
      }
    };
    
    input.click();
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    try {
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      
      const response = await apiService.uploadFiles(projectId, dt.files);
      if (response.success) {
        onFileUpdate();
        alert(`${files.length} فایل با موفقیت اضافه شد!`);
      }
    } catch (error: any) {
      console.error('خطا در آپلود فایل‌ها:', error);
      alert(error.message || 'خطا در آپلود فایل‌ها');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileModalConfirm = async (selectedFiles: File[]) => {
    await uploadFiles(selectedFiles);
    setShowFileModal(false);
  };

  const handleFileModalClose = () => {
    setShowFileModal(false);
    setPendingFiles([]);
    setSelectedDirectory('');
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">مدیریت فایل‌ها</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Add Individual Files */}
        <button
          onClick={handleAddFiles}
          disabled={isUploading}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 hover:bg-white/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CloudArrowUpIcon className="w-8 h-8 text-blue-400 mb-3" />
          <h4 className="text-white font-medium mb-1">اضافه کردن فایل‌ها</h4>
          <p className="text-white/60 text-sm text-center">
            انتخاب فایل‌های جداگانه برای اضافه کردن به پروژه
          </p>
        </button>

        {/* Add Directory */}
        <button
          onClick={handleAddDirectory}
          disabled={isUploading}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/30 rounded-lg hover:border-white/50 hover:bg-white/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FolderIcon className="w-8 h-8 text-green-400 mb-3" />
          <h4 className="text-white font-medium mb-1">اضافه کردن پوشه</h4>
          <p className="text-white/60 text-sm text-center">
            انتخاب پوشه کامل با تمام زیرپوشه‌ها
          </p>
        </button>
      </div>

      {isUploading && (
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin ml-3"></div>
            <span className="text-blue-400 text-sm">در حال آپلود فایل‌ها...</span>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <h4 className="text-white font-medium mb-2">نکات مهم:</h4>
        <ul className="space-y-1 text-white/70 text-sm">
          <li>• فایل‌های سیستمی (node_modules، .git) به صورت خودکار فیلتر می‌شوند</li>
          <li>• ساختار پوشه‌ها و زیرپوشه‌ها حفظ می‌شود</li>
          <li>• تغییرات بلافاصله در ساختار پروژه اعمال می‌شوند</li>
          <li>• فایل‌های تکراری جایگزین نمی‌شوند</li>
        </ul>
      </div>

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

export default ProjectFileManager; 