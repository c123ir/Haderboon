// components/ProjectFileManager.tsx
import React from 'react';
import { FolderPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface ProjectFileManagerProps {
  projectId: string;
  onFileUpdate?: () => void;
}

const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({ 
  projectId, 
  onFileUpdate = () => {} 
}) => {
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const response = await apiService.uploadFiles(projectId, files);
      if (response.success) {
        onFileUpdate();
        alert(`${files.length} فایل با موفقیت اضافه شد!`);
      } else {
        alert(`خطا در آپلود فایل‌ها: ${response.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود فایل‌ها');
    }
  };

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const response = await apiService.uploadFiles(projectId, files);
      if (response.success) {
        onFileUpdate();
        alert(`${files.length} فایل با موفقیت اضافه شد!`);
      } else {
        alert(`خطا در آپلود پوشه: ${response.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود پوشه');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">مدیریت فایل‌های پروژه</h3>
        <p className="text-white/60 text-sm mb-6">
          از طریق این بخش می‌توانید فایل‌های جدید به پروژه اضافه کنید یا فایل‌های موجود را مدیریت کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="glass-card hover:bg-white/10 transition-colors duration-200 cursor-pointer">
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <FolderPlusIcon className="w-8 h-8 text-blue-400 mb-3 mx-auto" />
              <h4 className="text-white font-medium mb-1">اضافه کردن پوشه</h4>
              <p className="text-white/60 text-sm">انتخاب و آپلود پوشه کامل</p>
            </div>
          </div>
          <input
            type="file"
            multiple
            webkitdirectory=""
            directory=""
            onChange={handleFolderSelect}
            className="hidden"
          />
        </label>

        <label className="glass-card hover:bg-white/10 transition-colors duration-200 cursor-pointer">
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <DocumentPlusIcon className="w-8 h-8 text-green-400 mb-3 mx-auto" />
              <h4 className="text-white font-medium mb-1">اضافه کردن فایل</h4>
              <p className="text-white/60 text-sm">انتخاب فایل‌های منفرد</p>
            </div>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <div className="glass-card">
        <h4 className="text-white font-medium mb-3">راهنما</h4>
        <ul className="space-y-2 text-white/70 text-sm">
          <li>• برای اضافه کردن فایل‌های جدید از دکمه‌های بالا استفاده کنید</li>
          <li>• فایل‌های سیستمی مانند node_modules خودکار فیلتر می‌شوند</li>
          <li>• تغییرات بلافاصله در ساختار پروژه اعمال می‌شود</li>
        </ul>
      </div>
    </div>
  );
};

export default ProjectFileManager;