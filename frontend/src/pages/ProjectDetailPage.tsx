// pages/ProjectDetailPage.tsx - تصحیح import ها
import React, { useState, useCallback } from 'react';
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

// Import های اصلاح شده
import { apiService } from '../services/api';
import { useProject } from '../hooks/useProject';
import { useProjectFiles } from '../hooks';
import FileTree from '../components/FileTree';
import FileContentViewer from '../components/FileContentViewer';
import WatchingStatus from '../components/WatchingStatus';
import ProjectFileManager from '../components/ProjectFileManager';

// Type definitions
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

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  console.log('🔍 ProjectDetailPage - URL param id:', id);
  console.log('🔍 ProjectDetailPage - typeof id:', typeof id);
  
  // استفاده از hook های محلی
  const { project, loading: projectLoading, error: projectError, refetch: refetchProject } = useProject(id!);
  const { files, error: filesError, refetch: refetchFiles } = useProjectFiles(id!);
  
  console.log('🔍 ProjectDetailPage - project object:', project);
  console.log('🔍 ProjectDetailPage - project?.id:', project?.id);
  
  // State management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'overview' | 'manager'>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Event handlers
  const handleFileSelect = useCallback(async (file: FileNode) => {
    console.log('🔍 File select called with:', file);
    console.log('📦 Current project:', project);
    console.log('🆔 Project ID:', project?.id);
    
    if (file.type === 'directory') {
      console.log('📁 Directory clicked, ignoring');
      return;
    }
    
    if (!project) {
      console.error('❌ No project available!');
      return;
    }
    
    if (!project.id) {
      console.error('❌ Project ID is missing!', project);
      return;
    }
    
    setSelectedFile(file.path);
    setLoadingContent(true);
    
    try {
      console.log('🌐 Calling API with projectId:', project.id, 'fileId:', file.id);
      const response = await apiService.getFileContent(project.id, file.id);
      
      console.log('📡 API Response:', response);
      
      if (response.success && response.data) {
        setFileContent({
          name: file.name,
          content: response.data.content || '',
          path: file.path,
          size: file.size || 0,
          lastModified: file.lastModified || new Date().toISOString(),
          type: file.fileType || 'text'
        });
      } else {
        console.error('Error getting file content:', response.message);
        setFileContent(null);
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
      const response = await apiService.reAnalyzeProject(project.id);
      if (response.success) {
        await refetchProject();
        await refetchFiles();
      } else {
        console.error('Re-analyze error:', response.message);
      }
    } catch (error) {
      console.error('Error re-analyzing project:', error);
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleFileUpdate = () => {
    refetchFiles();
  };

  // Data processing
  const fileTree: FileNode[] = React.useMemo(() => {
    if (!files || files.length === 0) return [];
    
    return files.map((file: any) => ({
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

  const getProjectStats = useCallback(() => {
    if (!files || !Array.isArray(files)) return { totalFiles: 0, totalSize: 0, fileTypes: {} };
    
    const stats = files.reduce((acc: any, file: any) => {
      if (!file.isDirectory) {
        acc.totalFiles++;
        acc.totalSize += file.size || 0;
        
        const ext = file.name.split('.').pop()?.toLowerCase() || 'other';
        acc.fileTypes[ext] = (acc.fileTypes[ext] || 0) + 1;
      }
      return acc;
    }, { totalFiles: 0, totalSize: 0, fileTypes: {} as Record<string, number> });
    
    return stats;
  }, [files]);

  // Format helpers
  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Loading state
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

  // Error state
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
              className="ml-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-white/60 mt-1">{project.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowPathIcon className={`w-4 h-4 ml-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
              {isReanalyzing ? 'در حال تحلیل...' : 'تحلیل مجدد'}
            </button>
            
            <Link
              to={`/projects/${project.id}/chat`}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
              چت هوشمند
            </Link>
            
            <Link
              to={`/projects/${project.id}/prompt`}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              <SparklesIcon className="w-4 h-4 ml-2" />
              تولید پرامپت
            </Link>
          </div>
        </div>
        
        {/* Project Status */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <WatchingStatus
            projectId={project.id}
            projectName={project.name}
            projectPath={project.originalPath || ''}
            initialStatus={project.status as "WATCHING" | "READY" | "ANALYZING" | "UPLOADING" | "ERROR" | "ARCHIVED"}
          />
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 flex-shrink-0 overflow-hidden`}>
          {!sidebarCollapsed && (
            <div className="h-full glass-card flex flex-col">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">ساختار پروژه</h2>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors duration-200"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* File Tree */}
              <div className="flex-1 overflow-auto">
                {filesError ? (
                  <div className="p-4 text-center">
                    <p className="text-red-400 text-sm mb-2">خطا در بارگذاری فایل‌ها</p>
                    <button
                      onClick={refetchFiles}
                      className="text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      تلاش مجدد
                    </button>
                  </div>
                ) : fileTree.length === 0 ? (
                  <div className="p-4 text-center">
                    <FolderIcon className="w-12 h-12 text-white/30 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">فایلی یافت نشد</p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">نام پروژه:</span>
                        <span className="text-white mr-2">{project.name}</span>
                      </div>
                      <div>
                        <span className="text-white/60">وضعیت:</span>
                        <span className={`mr-2 px-2 py-1 rounded text-xs ${
                          project.status === 'READY' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'ANALYZING' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {project.status === 'READY' ? 'آماده' :
                           project.status === 'ANALYZING' ? 'در حال تحلیل' : 'نامعلوم'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">تعداد فایل‌ها:</span>
                        <span className="text-white mr-2">{stats.totalFiles.toLocaleString('fa-IR')}</span>
                      </div>
                      <div>
                        <span className="text-white/60">حجم کل:</span>
                        <span className="text-white mr-2">{formatFileSize(stats.totalSize)}</span>
                      </div>
                      {project.originalPath && (
                        <div className="col-span-1 sm:col-span-2">
                          <span className="text-white/60">مسیر اصلی:</span>
                          <span className="text-white mr-2 font-mono text-xs break-all">
                            {project.originalPath}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* File Types Statistics */}
                  {Object.keys(stats.fileTypes).length > 0 && (
                    <div className="glass-card">
                      <h3 className="text-lg font-semibold text-white mb-4">آمار انواع فایل‌ها</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(stats.fileTypes)
                          .sort(([,a], [,b]) => (b as number) - (a as number))
                          .slice(0, 8)
                          .map(([type, count]) => (
                            <div key={type} className="bg-white/5 rounded-lg p-3">
                              <div className="text-blue-400 font-medium">.{type}</div>
                              <div className="text-white/80 text-sm">{Number(count)} فایل</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Activity */}
                  <div className="glass-card">
                    <h3 className="text-lg font-semibold text-white mb-4">فعالیت‌های اخیر</h3>
                    <div className="space-y-3">
                      {project.lastAnalyzed && (
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="text-white font-medium">تحلیل پروژه</div>
                            <div className="text-white/60 text-sm">
                              {formatDate(project.lastAnalyzed)}
                            </div>
                          </div>
                          <div className="text-green-400">✓</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <div className="text-white font-medium">ایجاد پروژه</div>
                          <div className="text-white/60 text-sm">
                            {formatDate(project.createdAt)}
                          </div>
                        </div>
                        <div className="text-blue-400">✓</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'manager' && (
              <div className="p-6 overflow-auto">
                <ProjectFileManager 
                  projectId={project.id} 
                  onFileUpdate={handleFileUpdate}
                />
              </div>
            )}
          </div>
        </div>

        {/* Collapsed Sidebar Toggle */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gray-800/90 hover:bg-gray-700/90 rounded-lg border border-white/10 transition-colors duration-200"
            title="نمایش sidebar"
          >
            <Bars3Icon className="w-5 h-5 text-white/60" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;