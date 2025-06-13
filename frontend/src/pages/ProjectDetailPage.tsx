// frontend/src/pages/ProjectDetailPage.tsx

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FolderIcon,
  DocumentIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CodeBracketIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { getProjectById, mockFileTree, mockDocumentation } from '../utils/mockData';
import { FileTreeNode } from '../types';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || '');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [selectedFile, setSelectedFile] = useState<FileTreeNode | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'docs' | 'analysis'>('files');

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

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderFileTree = (nodes: FileTreeNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.id}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-white/5 rounded cursor-pointer ${
            selectedFile?.id === node.id ? 'bg-blue-500/20' : ''
          }`}
          style={{ paddingRight: `${level * 20 + 12}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleNode(node.id);
            } else {
              setSelectedFile(node);
            }
          }}
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
          <span className="text-white text-sm">{node.name}</span>
          {node.type === 'file' && node.size && (
            <span className="text-white/40 text-xs mr-auto">
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

  const getStatusIcon = () => {
    switch (project.status) {
      case 'ready':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'analyzing':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (project.status) {
      case 'ready':
        return 'آماده';
      case 'analyzing':
        return 'در حال تحلیل';
      default:
        return 'نامشخص';
    }
  };

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
                {getStatusIcon()}
                <span className="text-sm text-white/60 mr-2">{getStatusText()}</span>
              </div>
            </div>
            {project.description && (
              <p className="text-white/70 mb-4">{project.description}</p>
            )}
            <div className="flex items-center space-x-6 space-x-reverse text-sm text-white/60">
              <span>{project.filesCount} فایل</span>
              <span>ایجاد شده: {new Date(project.createdAt).toLocaleDateString('fa-IR')}</span>
              {project.lastAnalyzed && (
                <span>آخرین تحلیل: {new Date(project.lastAnalyzed).toLocaleDateString('fa-IR')}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
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

      {/* Tabs */}
      <div className="glass-card">
        <div className="flex space-x-1 space-x-reverse">
          {[
            { id: 'files', label: 'ساختار فایل‌ها', icon: FolderIcon },
            { id: 'docs', label: 'مستندات', icon: DocumentIcon },
            { id: 'analysis', label: 'تحلیل کد', icon: CodeBracketIcon },
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
                {renderFileTree(mockFileTree)}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              {mockDocumentation.map((doc) => (
                <div key={doc.id} className="glass-card">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{doc.title}</h3>
                      <div className="flex items-center mt-2 space-x-4 space-x-reverse">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.status === 'final' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {doc.status === 'final' ? 'نهایی' : 'پیش‌نویس'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          doc.type === 'auto'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {doc.type === 'auto' ? 'خودکار' : 'دستی'}
                        </span>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <pre className="text-white/70 text-sm whitespace-pre-wrap bg-black/20 p-4 rounded-lg overflow-x-auto">
                      {doc.content.substring(0, 300)}...
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">تحلیل کد</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">توابع</h4>
                    <p className="text-2xl font-bold text-blue-400">23</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">کلاس‌ها</h4>
                    <p className="text-2xl font-bold text-green-400">8</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">خطوط کد</h4>
                    <p className="text-2xl font-bold text-yellow-400">1,247</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-2">پیچیدگی</h4>
                    <p className="text-2xl font-bold text-purple-400">متوسط</p>
                  </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">تکنولوژی‌های شناسایی شده</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['React', 'TypeScript', 'Tailwind CSS', 'Axios'].map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
                  <p className="text-white text-sm font-mono">{selectedFile.path}</p>
                </div>
                {selectedFile.size && (
                  <div>
                    <span className="text-white/60 text-sm">حجم:</span>
                    <p className="text-white">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
                {selectedFile.lastModified && (
                  <div>
                    <span className="text-white/60 text-sm">آخرین تغییر:</span>
                    <p className="text-white text-sm">
                      {new Date(selectedFile.lastModified).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                )}
              </div>
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
              <button className="block w-full p-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors duration-200">
                تحلیل مجدد
              </button>
            </div>
          </div>

          {/* Project Stats */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">آمار پروژه</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">کل فایل‌ها:</span>
                <span className="text-white">{project.filesCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">مستندات:</span>
                <span className="text-white">{mockDocumentation.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">وضعیت:</span>
                <span className="text-white">{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;