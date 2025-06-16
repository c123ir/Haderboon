// hooks/useProject.ts
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
    console.log('📡 useProject fetchProject called with id:', id);
    
    if (!id) {
      console.warn('📡 useProject: No ID provided, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('📡 useProject: Making API call to getProject with id:', id);
      
      const response = await apiService.getProject(id);
      console.log('📡 useProject API response:', response);
      
      if (response.success) {
        console.log('📡 useProject: Setting project data:', response.data);
        setProject(response.data);
      } else {
        console.error('📡 useProject: API returned error:', response.message);
        setError(response.message || 'خطا در دریافت پروژه');
      }
    } catch (err: any) {
      console.error('📡 useProject: Exception occurred:', err);
      setError(err.message || 'خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
};

export default useProject;