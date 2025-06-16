// frontend/src/pages/ProjectDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PlusIcon,
  EyeIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import WatchingStatus from '../components/WatchingStatus';
import ProjectFileManager from '../components/ProjectFileManager';

interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileTreeNode[];
  size?: number;
  fileType?: string;
  analysis?: any;
  lastModified?: string;
}

interface FileContent {
  id: string;
  name: string;
  path: string;
  type: string;
  size: string;
  content: string;
  analysis?: any;
}

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<FileContent | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'analysis' | 'manage'>('files');
  const [loading, setLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Load project details and files in parallel
      const [projectResponse, filesResponse] = await Promise.all([
        apiService.getProject(id!),
        apiService.getProjectFiles(id!)
      ]);

      if (projectResponse.success) {
        setProject(projectResponse.data);
      }

      if (filesResponse.success) {
        console.log('📁 File tree data:', filesResponse.data);
        setFileTree(filesResponse.data.fileTree || []);
        
        // Auto-expand first level directories
        const firstLevelDirs = (filesResponse.data.fileTree || [])
          .filter((node: FileTreeNode) => node.type === 'directory')
          .map((node: FileTreeNode) => node.id);
        setExpandedNodes(new Set(['root', ...firstLevelDirs]));
      }

    } catch (error) {
      console.error('خطا در بارگذاری اطلاعات پروژه:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleFileSelect = async (node: FileTreeNode) => {
    if (node.type === 'directory') {
      toggleNode(node.id);
    } else {
      setSelectedFile(node);
      setLoadingFileContent(true);
      
      try {
        const response = await apiService.getFileContent(id!, node.id);
        if (response.success) {
          setSelectedFileContent(response.data);
        }
      } catch (error) {
        console.error('خطا در بارگذاری محتوای فایل:', error);
      } finally {
        setLoadingFileContent(false);
      }
    }
  };

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      const response = await apiService.reAnalyzeProject(id!);
      
      if (response.success) {
        await loadProjectData();
        alert('تحلیل مجدد با موفقیت انجام شد');
      }
    } catch (error: any) {
      console.error('خطا در تحلیل مجدد:', error);
      alert(error.message || 'خطا در تحلیل مجدد');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const getFileIcon = (fileName: string, isDirectory: boolean) => {
    if (isDirectory) {
      return expandedNodes.has(fileName) ? FolderOpenIcon : FolderIcon;
    }
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return CodeBracketIcon;
      default:
        return DocumentIcon;
    }
  };

  const renderFileTree = (nodes: FileTreeNode[], level: number = 0) => {
    return nodes.map((node) => {
      const Icon = getFileIcon(node.name, node.type === 'directory');
      const isExpanded = expandedNodes.has(node.id);
      const isSelected = selectedFile?.id === node.id;
      
      return (
        <div key={node.id}>
          <div
            className={`flex items-center py-1 px-2 hover:bg-white/10 rounded cursor-pointer transition-colors duration-150 ${
              isSelected ? 'bg-blue-500/30' : ''
            }`}
            style={{ paddingRight: `${level * 16 + 8}px` }}
            onClick={() => handleFileSelect(node)}
          >
            {node.type === 'directory' && (
              <span className="w-4 h-4 flex items-center justify-center ml-1">
                {isExpanded ? (
                  <ChevronDownIcon className="w-3 h-3 text-white/60" />
                ) : (
                  <ChevronRightIcon className="w-3 h-3 text-white/60" />
                )}
              </span>
            )}
            {node.type === 'file' && <div className="w-5 h-4" />}
            
            <Icon className={`w-4 h-4 ml-2 ${
              node.type === 'directory' 
                ? isExpanded ? 'text-blue-400' : 'text-blue-300'
                : 'text-gray-400'
            }`} />
            
            <span className="text-white text-sm flex-1 truncate">{node.name}</span>
            
            {node.type === 'file' && node.size && (
              <span className="text-white/40 text-xs ml-2">
                {formatFileSize(node.size)}
              </span>
            )}
          </div>
          
          {node.type === 'directory' && node.children && isExpanded && (
            <div>{renderFileTree(node.children, level + 1)}</div>
          )}
        </div>
      );
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'ANALYZING':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'READY':
        return 'آماده';
      case 'ANALYZING':
        return 'در حال تحلیل';
      case 'UPLOADING':
        return 'در حال آپلود';
      default:
        return 'نامشخص';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <FolderIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">پروژه یافت نشد</h2>
        <p className="text-white/60 mb-4">پروژه‌ای با این شناسه موجود نیست</p>
        <Link
          to="/projects"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          بازگشت به پروژه‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="glass-card mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FolderIcon className="w-6 h-6 text-blue-400 ml-3" />
            <h1 className="text-xl font-bold text-white">{project.name}</h1>
            <div className="flex items-center mr-4">
              {getStatusIcon(project.status)}
              <span className="text-sm text-white/60 mr-2">{getStatusText(project.status)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 text-sm"
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
      <div className="mb-4">
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
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} flex-shrink-0 border-l border-white/20 transition-all duration-200 overflow-hidden`}>
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <h3 className="text-sm font-medium text-white">ساختار پروژه</h3>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-white/60 hover:text-white p-1"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            {/* File Tree */}
            <div className="flex-1 overflow-auto p-2">
              {fileTree.length > 0 ? (
                renderFileTree(fileTree)
              ) : (
                <p className="text-white/60 text-center py-8 text-sm">
                  هیچ فایلی در این پروژه موجود نیست
                </p>
              )}
            </div>
            
            {/* Sidebar Footer */}
            <div className="p-3 border-t border-white/10 text-xs text-white/60">
              {project.filesCount || 0} فایل
            </div>
          </div>
        </div>

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
                     {/* Tabs */}
           <div className="flex items-center border-b border-white/10 px-4">
             {sidebarCollapsed && (
               <button
                 onClick={() => setSidebarCollapsed(false)}
                 className="text-white/60 hover:text-white p-2 ml-2"
               >
                 <Bars3Icon className="w-4 h-4" />
               </button>
             )}
            
            {[
              { id: 'files', label: 'نمایش فایل', icon: EyeIcon },
              { id: 'analysis', label: 'تحلیل', icon: CodeBracketIcon },
              { id: 'manage', label: 'مدیریت', icon: PlusIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-4 py-3 text-sm transition-colors duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-white'
                      : 'border-transparent text-white/60 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 ml-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'files' && (
              <div>
                {selectedFile ? (
                  <div className="space-y-6">
                    {/* File Info Header */}
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <DocumentIcon className="w-5 h-5 text-gray-400 ml-3" />
                        <h2 className="text-lg font-medium text-white">{selectedFile.name}</h2>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-white/60">مسیر:</span>
                          <p className="text-white font-mono text-xs mt-1 break-all">{selectedFile.path}</p>
                        </div>
                        {selectedFile.size && (
                          <div>
                            <span className="text-white/60">حجم:</span>
                            <p className="text-white mt-1">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-white/60">نوع:</span>
                          <p className="text-white mt-1">{selectedFile.fileType || 'نامشخص'}</p>
                        </div>
                        <div>
                          <span className="text-white/60">آخرین تغییر:</span>
                          <p className="text-white mt-1">
                            {selectedFile.lastModified 
                              ? new Date(selectedFile.lastModified).toLocaleDateString('fa-IR')
                              : 'نامشخص'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* File Content */}
                    {loadingFileContent ? (
                      <div className="bg-black/20 rounded-lg p-8 text-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-white/60">در حال بارگذاری محتوا...</p>
                      </div>
                    ) : selectedFileContent?.content ? (
                      <div className="bg-black/20 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                          <span className="text-sm text-white/60">محتوای فایل</span>
                          <span className="text-xs text-white/40">
                            {selectedFileContent.content.split('\n').length} خط
                          </span>
                        </div>
                        <pre className="p-4 text-white/90 text-sm overflow-auto max-h-96 leading-relaxed">
                          <code>{selectedFileContent.content}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-white/5 rounded-lg p-8 text-center">
                        <DocumentIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
                        <p className="text-white/60">محتوای فایل قابل نمایش نیست</p>
                      </div>
                    )}

                    {/* File Analysis */}
                    {selectedFileContent?.analysis && (
                      <div className="bg-white/5 rounded-lg p-4">
                        <h3 className="text-white font-medium mb-3">تحلیل فایل</h3>
                        <div className="text-sm text-white/70">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(selectedFileContent.analysis, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FolderIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">فایلی انتخاب نشده</h3>
                    <p className="text-white/60">از sidebar یک فایل انتخاب کنید تا محتوای آن نمایش داده شود</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">تحلیل پروژه</h3>
                {project.analysisData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">کل فایل‌ها</h4>
                        <p className="text-2xl font-bold text-blue-400">{project.analysisData.totalFiles || 0}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">زبان‌های برنامه‌نویسی</h4>
                        <p className="text-2xl font-bold text-green-400">
                          {Object.keys(project.analysisData.languages || {}).length}
                        </p>
                      </div>
                    </div>
                    
                    {project.analysisData.frameworks && project.analysisData.frameworks.length > 0 && (
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">فریمورک‌های شناسایی شده</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.analysisData.frameworks.map((framework: string) => (
                            <span key={framework} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                              {framework}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.analysisData.summary && (
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">خلاصه تحلیل</h4>
                        <p className="text-white/70">{project.analysisData.summary}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <CodeBracketIcon className="w-16 h-16 text-white/40 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">تحلیل در دسترس نیست</h3>
                    <p className="text-white/60 mb-4">تحلیل کد هنوز انجام نشده است</p>
                    <button
                      onClick={handleReanalyze}
                      disabled={isReanalyzing}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                    >
                      <ArrowPathIcon className={`w-4 h-4 ml-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
                      شروع تحلیل
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'manage' && (
              <ProjectFileManager
                projectId={project.id}
                onFileUpdate={loadProjectData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;