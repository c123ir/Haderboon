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
      console.log('📁 API Response for files:', response);
      
      if (response.success) {
        // Handle the API response structure correctly
        const filesData = response.data?.files || response.data || [];
        console.log('📄 Files data:', filesData);
        
        if (Array.isArray(filesData)) {
          setFiles(filesData);
        } else {
          console.error('❌ Files data is not an array:', typeof filesData, filesData);
          setFiles([]);
          setError('ساختار داده فایل‌ها نامعتبر است');
        }
      } else {
        setError(response.message || 'خطا در دریافت فایل‌ها');
        setFiles([]);
      }
    } catch (err: any) {
      console.error('❌ Files fetch error:', err);
      setError(err.message || 'خطا در اتصال به سرور');
      setFiles([]);
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