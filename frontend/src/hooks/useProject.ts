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
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getProject(id);
      
      if (response.success) {
        // Handle nested response structure
        const projectData = response.data?.data || response.data;
        setProject(projectData);
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
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
};

export default useProject;