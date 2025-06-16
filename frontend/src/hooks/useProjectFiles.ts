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
        // The API service wraps the backend response, so we need to access response.data.data.files
        // Backend response: { success: true, data: { files: [...], fileTree: [...] }, message: "..." }
        // API service response: { success: true, data: <backend-response> }
        let filesData;
        
        if (response.data?.data?.files) {
          // Double-wrapped response from API service
          filesData = response.data.data.files;
          console.log('📄 Files data found at response.data.data.files:', filesData);
        } else if (response.data?.files) {
          // Single-wrapped response (direct from backend)
          filesData = response.data.files;
          console.log('📄 Files data found at response.data.files:', filesData);
        } else if (Array.isArray(response.data)) {
          // Direct array response
          filesData = response.data;
          console.log('📄 Files data found at response.data (direct array):', filesData);
        } else {
          console.error('❌ Files data structure not found:', response.data);
          filesData = [];
        }
        
        console.log('📄 Final files data type:', typeof filesData, 'is array:', Array.isArray(filesData));
        
        if (Array.isArray(filesData)) {
          setFiles(filesData);
          console.log('✅ Successfully set files:', filesData.length, 'files');
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