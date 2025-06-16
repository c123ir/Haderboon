// مرحله به مرحله رفع مشکلات:

// 1. در فایل components/index.ts (ایجاد کنید اگر وجود ندارد)
export { default as FileTree } from './FileTree';
export { default as FileContentViewer } from './FileContentViewer';
export { default as WatchingStatus } from './WatchingStatus';
export { default as ProjectFileManager } from './ProjectFileManager';

// 2. در فایل hooks/index.ts (ایجاد کنید اگر وجود ندارد)
export { default as useProject } from './useProject';
export { default as useProjectFiles } from './useProjectFiles';

// 3. ایجاد فایل hooks/useProject.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  originalPath?: string;
  createdAt: string;
  lastAnalyzed?: string;
}

export const useProject = (id: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProject(id);
      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.message || 'خطا در دریافت پروژه');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
};

export default useProject;

// 4. ایجاد فایل hooks/useProjectFiles.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: string;
  size?: number;
  isDirectory: boolean;
  updatedAt: string;
}

export const useProjectFiles = (projectId: string) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProjectFiles(projectId);
      if (response.success) {
        setFiles(response.data || []);
      } else {
        setError(response.message || 'خطا در دریافت فایل‌ها');
      }
    } catch (err: any) {
      setError(err.message || 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, refetch: fetchFiles };
};

export default useProjectFiles;

// 5. بررسی فایل services/api.ts - اضافه کردن متدهای مورد نیاز
// در صورتی که این متدها وجود ندارند، اضافه کنید:

// در api.ts، اطمینان حاصل کنید که این متدها وجود دارند:
const apiMethods = {
  // ... سایر متدها

  // دریافت اطلاعات پروژه
  getProject: async (projectId: string) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get project error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در دریافت پروژه'
      };
    }
  },

  // دریافت فایل‌های پروژه
  getProjectFiles: async (projectId: string) => {
    try {
      const response = await api.get(`/files/projects/${projectId}/files`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get project files error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در دریافت فایل‌ها'
      };
    }
  },

  // دریافت محتوای فایل
  getFileContent: async (projectId: string, fileId: string) => {
    try {
      const response = await api.get(`/files/projects/${projectId}/files/${fileId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Get file content error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در دریافت محتوای فایل'
      };
    }
  },

  // تحلیل مجدد پروژه
  reAnalyzeProject: async (projectId: string) => {
    try {
      const response = await api.post(`/files/projects/${projectId}/reanalyze`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Re-analyze project error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'خطا در تحلیل مجدد پروژه'
      };
    }
  }
};

// 6. کامپوننت WatchingStatus ساده (اگر وجود ندارد)
// فایل components/WatchingStatus.tsx
import React from 'react';

interface WatchingStatusProps {
  projectId: string;
  projectName: string;
  projectPath?: string;
  initialStatus?: string;
}

const WatchingStatus: React.FC<WatchingStatusProps> = ({
  projectId,
  projectName,
  initialStatus = 'READY'
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'READY': return 'bg-green-400';
      case 'ANALYZING': return 'bg-yellow-400';
      case 'ERROR': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY': return 'آماده';
      case 'ANALYZING': return 'در حال تحلیل';
      case 'ERROR': return 'خطا';
      default: return 'نامعلوم';
    }
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 ${getStatusColor(initialStatus)} rounded-full ml-3`}></div>
          <span className="text-white text-sm">
            پروژه {projectName} - {getStatusText(initialStatus)}
          </span>
        </div>
        <div className="text-white/60 text-xs">
          ID: {projectId}
        </div>
      </div>
    </div>
  );
};

export default WatchingStatus;

// 7. کامپوننت ProjectFileManager ساده (اگر وجود ندارد)
// فایل components/ProjectFileManager.tsx
import React from 'react';
import { FolderPlusIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';

interface ProjectFileManagerProps {
  projectId: string;
}

const ProjectFileManager: React.FC<ProjectFileManagerProps> = ({ projectId }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">مدیریت فایل‌های پروژه</h3>
        <p className="text-white/60 text-sm mb-6">
          از طریق این بخش می‌توانید فایل‌های جدید به پروژه اضافه کنید یا فایل‌های موجود را مدیریت کنید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="glass-card hover:bg-white/10 transition-colors duration-200">
          <div className="flex items-center justify-center p-6">
            <FolderPlusIcon className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-center">
              <h4 className="text-white font-medium mb-1">اضافه کردن پوشه</h4>
              <p className="text-white/60 text-sm">انتخاب و آپلود پوشه کامل</p>
            </div>
          </div>
        </button>

        <button className="glass-card hover:bg-white/10 transition-colors duration-200">
          <div className="flex items-center justify-center p-6">
            <DocumentPlusIcon className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-center">
              <h4 className="text-white font-medium mb-1">اضافه کردن فایل</h4>
              <p className="text-white/60 text-sm">انتخاب فایل‌های منفرد</p>
            </div>
          </div>
        </button>
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