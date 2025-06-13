// frontend/src/pages/ProjectDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderIcon,
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

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'analysis' | 'manage'>('files');
  const [loading, setLoading] = useState(true);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

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
        setFileTree(filesResponse.data.fileTree || []);
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
      // Load file content
      try {
        const response = await apiService.getFileContent(id!, node.id);
        if (response.success) {
          setSelectedFileContent(response.data);
        }
      } catch (error) {
        console.error('خطا در بارگذاری محتوای فایل:', error);
      }
    }
  };

  const handleReanalyze = async () => {
    try {
      setIsReanalyzing(true);
      const response = await apiService.reAnalyzeProject(id!);
      
      if (response.success) {
        // Reload project data
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

  const renderFileTree = (nodes: FileTreeNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-white/5 rounded cursor-pointer ${
            selectedFile?.id === node.id ? 'bg-blue-500/20' : ''
          }`}
          style={{ paddingRight: `${level * 20 + 12}px` }}
          onClick={() => handleFileSelect(node)}
        >
          {node.type === 'directory' ? (
            <>
              {expandedNodes.has(node.id) ? (
                <ChevronDownIcon className="w-4 h-4 text-white/60 ml-2" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-white/60 ml-2" />
              )}
              <FolderIcon className="w-4 h-4 text-blue-400 ml-2" />
            </>
          ) : (
            <>
              <div className="w-4 h-4 ml-2" />
              <DocumentIcon className="w-4 h-4 text-gray-400 ml-2" />
            </>
          )}
          <span className="text-white text-sm flex-1">{node.name}</span>
          {node.type === 'file' && node.size && (
            <span className="text-white/40 text-xs">
              {(node.size / 1024).toFixed(1)}KB
            </span>
          )}
        </div>
        {node.type === 'directory' && node.children && expandedNodes.has(node.id) && (
          <div>{renderFileTree(node.children, level + 1)}</div>
        )}
      </div>
    ));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <FolderIcon className="w-6 h-6 text-blue-400 ml-3" />
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <div className="flex items-center mr-4">
                {getStatusIcon(project.status)}
                <span className="text-sm text-white/60 mr-2">{getStatusText(project.status)}</span>
              </div>
            </div>
            {project.description && (
              <p className="text-white/70 mb-4">{project.description}</p>
            )}
            <div className="flex items-center space-x-6 space-x-reverse text-sm text-white/60">
              <span>{project.filesCount || 0} فایل</span>
              <span>ایجاد شده: {new Date(project.createdAt).toLocaleDateString('fa-IR')}</span>
              {project.lastAnalyzed && (
                <span>آخرین تحلیل: {new Date(project.lastAnalyzed).toLocaleDateString('fa-IR')}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleReanalyze}
              disabled={isReanalyzing}
              className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
            >
              <ArrowPathIcon className={`w-4 h-4 ml-2 ${isReanalyzing ? 'animate-spin' : ''}`} />
              {isReanalyzing ? 'در حال تحلیل...' : 'تحلیل مجدد'}
            </button>
            <Link
              to={`/projects/${project.id}/chat`}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 ml-2" />
              چت
            </Link>
            <Link
              to={`/projects/${project.id}/prompt`}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200"
            >
              <SparklesIcon className="w-4 h-4 ml-2" />
              تولید پرامپت
            </Link>
          </div>
        </div>
      </div>

      {/* Watching Status */}
      <WatchingStatus 
        projectId={project.id}
        projectName={project.name}
        projectPath={project.originalPath}
        initialStatus={project.status}
      />

      {/* Tabs */}
      <div className="glass-card">
        <div className="flex space-x-1 space-x-reverse">
          {[
            { id: 'files', label: 'ساختار فایل‌ها', icon: FolderIcon },
            { id: 'analysis', label: 'تحلیل کد', icon: CodeBracketIcon },
            { id: 'manage', label: 'مدیریت فایل‌ها', icon: PlusIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 ml-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'files' && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">ساختار فایل‌ها</h3>
              <div className="max-h-96 overflow-y-auto">
                {fileTree.length > 0 ? (
                  renderFileTree(fileTree)
                ) : (
                  <p className="text-white/60 text-center py-8">
                    هیچ فایلی در این پروژه موجود نیست
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">تحلیل کد</h3>
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
                <p className="text-white/60 text-center py-8">
                  تحلیل کد هنوز انجام نشده است
                </p>
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected File Details */}
          {selectedFile && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">جزئیات فایل</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-white/60 text-sm">نام:</span>
                  <p className="text-white">{selectedFile.name}</p>
                </div>
                <div>
                  <span className="text-white/60 text-sm">مسیر:</span>
                  <p className="text-white text-sm font-mono break-all">{selectedFile.path}</p>
                </div>
                {selectedFile.size && (
                  <div>
                    <span className="text-white/60 text-sm">حجم:</span>
                    <p className="text-white">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
                {selectedFileContent?.analysis && (
                  <div>
                    <span className="text-white/60 text-sm">تحلیل:</span>
                    <p className="text-white text-sm">{selectedFileContent.analysis.summary}</p>
                  </div>
                )}
              </div>
              
              {selectedFileContent?.content && (
                <div className="mt-4">
                  <h4 className="text-white font-medium mb-2">محتوای فایل:</h4>
                  <pre className="bg-black/20 p-3 rounded text-white/80 text-xs overflow-x-auto max-h-48">
                    {selectedFileContent.content.substring(0, 500)}
                    {selectedFileContent.content.length > 500 && '...'}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">عملیات سریع</h3>
            <div className="space-y-2">
              <Link
                to={`/projects/${project.id}/chat`}
                className="block w-full p-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors duration-200 text-center"
              >
                شروع چت
              </Link>
              <Link
                to={`/projects/${project.id}/prompt`}
                className="block w-full p-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-colors duration-200 text-center"
              >
                تولید پرامپت
              </Link>
            </div>
          </div>

          {/* Project Stats */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">آمار پروژه</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">کل فایل‌ها:</span>
                <span className="text-white">{project.filesCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">حجم کل:</span>
                <span className="text-white">
                  {project.totalSize ? (parseInt(project.totalSize.toString()) / 1024 / 1024).toFixed(2) + ' MB' : '0 MB'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">وضعیت:</span>
                <span className="text-white">{getStatusText(project.status)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;