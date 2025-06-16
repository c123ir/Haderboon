// pages/ProjectDetailPage.tsx - نسخه رفع شده
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ArrowPathIcon,
  Bars3Icon,
  XMarkIcon,
  FolderIcon,
  CodeBracketIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

// اگر این hook ها موجود نیستند، باید ایجاد کنیم
const useProject = (id: string) => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getProject(id);
      if (response.success) {
        setProject(response.data);
      } else {
        setError(response.message || 'خطا در دریافت پروژه');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return { project, loading, error, refetch: fetchProject };
};

const useProjectFiles = (id: string) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getProjectFiles(id);
      if (response.success) {
        setFiles(response.data || []);
      } else {
        setError(response.message || 'خطا در دریافت فایل‌ها');
      }
    } catch (err) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { files, loading, error, refetch: fetchFiles };
};

interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  fileType?: string;
  lastModified?: string;
  children?: FileNode[];
}

interface FileContent {
  name: string;
  content: string;
  path: string;
  size: number;
  lastModified: string;
  type: string;
}

// Simple FileContentViewer component
const FileContentViewer: React.FC<{ 
  file: FileContent | null;
  className?: string;
}> = ({ file, className = '' }) => {
  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-white/60">
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">فایلی انتخاب نشده</p>
          <p className="text-sm">برای مشاهده محتوا، فایلی از درخت انتخاب کنید</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-gray-900/50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-800/30">
        <div className="flex items-center space-x-3 space-x-reverse">
          <DocumentTextIcon className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">{file.name}</h3>
            <p className="text-white/60 text-sm">{file.path}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <pre className="text-white text-sm font-mono whitespace-pre-wrap">
          {file.content}
        </pre>
      </div>
    </div>
  );
};

// Simple FileTree component
const FileTree: React.FC<{
  files: FileNode[];
  selectedFile: string | null;
  onFileSelect: (file: FileNode) => void;
  className?: string;
}> = ({ files, selectedFile, onFileSelect, className = '' }) => {
  return (
    <div className={`overflow-auto h-full ${className}`} dir="ltr">
      <div className="p-2">
        {files.map(file => (
          <div
            key={file.id}
            className={`
              flex items-center cursor-pointer hover:bg-white/5 transition-colors duration-150 py-2 px-2 rounded
              ${selectedFile === file.path ? 'bg-blue-500/20 border-r-2 border-blue-400' : ''}
            `}
            onClick={() => file.type === 'file' && onFileSelect(file)}
          >
            {file.type === 'directory' ? (
              <FolderIcon className="w-4 h-4 text-blue-400 ml-2" />
            ) : (
              <DocumentTextIcon className="w-4 h-4 text-gray-400 ml-2" />
            )}
            <span className="text-white text-sm truncate">{file.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple WatchingStatus component
const WatchingStatus: React.FC<{
  projectId: string;
  projectName: string;
  projectPath?: string;
  initialStatus?: string;
}> = ({ projectId, projectName }) => {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full ml-3"></div>
          <span className="text-white text-sm">پروژه {projectName} آماده است</span>
        </div>
      </div>
    </div>
  );
};

// Simple ProjectFileManager component
const ProjectFileManager: React.FC<{ projectId: string }> = ({ projectId }) => {
  return (
    <div className="p-4">
      <h3 className="text-white text-lg mb-4">مدیریت فایل‌ها</h3>
      <p className="text-white/60">این بخش برای مدیریت فایل‌های پروژه طراحی شده است.</p>
    </div>
  );
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { project, loading: projectLoading, error: projectError, refetch: refetchProject } = useProject(id!);
  const { files, loading: filesLoading, error: filesError, refetch: refetchFiles } = useProjectFiles(id!);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'overview' | 'manager'>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  const handleFileSelect = useCallback(async (file: FileNode) => {
    if (file.type === 'directory') return;
    
    setSelectedFile(file.path);
    setLoadingContent(true);
    
    try {
      const response = await apiService.getFileContent(project!.id, file.id);
      if (response.success && response.data) {
        setFileContent({
          name: file.name,
          content: response.data.content || '',
          path: file.path,
          size: file.size || 0,
          lastModified: file.lastModified || new Date().toISOString(),
          type: file.fileType || 'text'
        });
      }
    } catch (error) {
      console.error('Error loading file content:', error);
      setFileContent(null);
    } finally {
      setLoadingContent(false);
    }
  }, [project]);

  const handleReanalyze = async () => {
    if (!project) return;
    
    setIsReanalyzing(true);
    try {
      await apiService.reAnalyzeProject(project.id);
      await refetchProject();
      await refetchFiles();
    } catch (error) {
      console.error('Error re-analyzing project:', error);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Convert flat files list to tree structure
  const fileTree: FileNode[] = React.useMemo(() => {
    if (!files || files.length === 0) return [];
    
    return files.map(file => ({
      id: file.id,
      name: file.name,
      path: file.path,
      type: file.isDirectory ? 'directory' : 'file',
      size: file.size,
      fileType: file.type,
      lastModified: file.updatedAt,
      children: file.isDirectory ? [] : undefined
    }));
  }, [files]);

  const getProjectStats = () => {
    if (!files) return { totalFiles: 0, totalSize: 0, fileTypes: {} };
    
    const stats = files.reduce((acc, file) => {
      if (!file.isDirectory) {
        acc.totalFiles++;
        acc.totalSize += file.size || 0;
        
        const ext = file.name.split('.').pop()?.toLowerCase() || 'other';
        acc.fileTypes[ext] = (acc.fileTypes[ext] || 0) + 1;
      }
      return acc;
    }, { totalFiles: 0, totalSize: 0, fileTypes: {} as Record<string, number> });
    
    return stats;
  };

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 space-x-reverse">
          <ArrowPathIcon className="w-6 h-6 text-blue-400 animate-spin" />
          <span className="text-white">بارگذاری پروژه...</span>
        </div>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">خطا در بارگذاری پروژه</h2>
        <p className="text-white/60 mb-4">{projectError}</p>
        <Link to="/projects" className="text-blue-400 hover:text-blue-300">
          بازگشت به پروژه‌ها
        </Link>
      </div>
    );
  }

  const stats = getProjectStats();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 glass-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/projects"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ml-3"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              <p className="text-white/60 text-sm">
                {project.description || 'بدون توضیحات'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <ArrowPathIcon className={`w-4 h-4 ml-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
              {isReanalyzing ? 'تحلیل...' : 'تحلیل مجدد'}
            </button>
            <Link
              to={`/projects/${project.id}/chat`}
              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
              چت
            </Link>
            <Link
              to={`/projects/${project.id}/prompt`}
              className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-sm"
            >
              <SparklesIcon className="w-4 h-4 ml-2" />
              پرامپت
            </Link>
          </div>
        </div>
      </div>

      {/* Watching Status */}
      <div className="flex-shrink-0 mb-4">
        <WatchingStatus 
          projectId={project.id}
          projectName={project.name}
          projectPath={project.originalPath}
          initialStatus={project.status}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden glass-card">
        {/* Sidebar - File Tree */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 border-l border-white/10 bg-gray-900/30 flex flex-col overflow-hidden`} dir="ltr">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2 space-x-reverse">
              <FolderIcon className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium text-sm">ساختار پروژه</span>
            </div>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
            >
              {sidebarCollapsed ? (
                <Bars3Icon className="w-4 h-4 text-white/60" />
              ) : (
                <XMarkIcon className="w-4 h-4 text-white/60" />
              )}
            </button>
          </div>

          {/* File Tree */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              {filesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-white/60 text-sm mr-2">بارگذاری فایل‌ها...</span>
                </div>
              ) : filesError ? (
                <div className="p-4 text-center">
                  <p className="text-red-400 text-sm mb-2">خطا در بارگذاری فایل‌ها</p>
                  <button
                    onClick={refetchFiles}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    تلاش مجدد
                  </button>
                </div>
              ) : (
                <FileTree
                  files={fileTree}
                  selectedFile={selectedFile}
                  onFileSelect={handleFileSelect}
                  className="h-full"
                />
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 bg-gray-800/20">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === 'files'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              <CodeBracketIcon className="w-4 h-4 inline ml-2" />
              محتوای فایل
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              <DocumentTextIcon className="w-4 h-4 inline ml-2" />
              خلاصه پروژه
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 ${
                activeTab === 'manager'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-white/60 border-transparent hover:text-white hover:border-white/20'
              }`}
            >
              <FolderIcon className="w-4 h-4 inline ml-2" />
              مدیریت فایل‌ها
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'files' && (
              <div className="h-full">
                {loadingContent ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
                      <span className="text-white/60">بارگذاری محتوای فایل...</span>
                    </div>
                  </div>
                ) : (
                  <FileContentViewer 
                    file={fileContent}
                    className="h-full"
                  />
                )}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="p-6 overflow-auto">
                <div className="space-y-6">
                  {/* Project Information */}
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold text-white mb-4">اطلاعات پروژه</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">نام پروژه:</span>
                        <span className="text-white mr-2">{project.name}</span>
                      </div>
                      <div>
                        <span className="text-white/60">تعداد فایل‌ها:</span>
                        <span className="text-white mr-2">{stats.totalFiles}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manager' && (
              <div className="p-6 overflow-auto">
                <ProjectFileManager projectId={project.id} />
              </div>
            )}
          </div>
        </div>

        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg border border-white/10 transition-colors duration-200"
          >
            <Bars3Icon className="w-5 h-5 text-white/60" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;