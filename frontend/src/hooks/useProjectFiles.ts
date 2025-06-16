// hooks/useProjectFiles.ts
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