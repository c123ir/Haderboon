// frontend/src/components/FileSelectionModal.tsx - برطرف شده

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  XMarkIcon, 
  FolderIcon, 
  DocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
  file?: File;
  isValid?: boolean;
  error?: string;
}

interface FileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: File[];
  directoryName: string;
  onConfirm: (selectedFiles: File[]) => void;
}

const FileSelectionModal: React.FC<FileSelectionModalProps> = ({
  isOpen,
  onClose,
  files,
  directoryName,
  onConfirm
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyValid, setShowOnlyValid] = useState(false);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  // Constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

  const shouldIgnoreFile = useCallback((filePath: string): boolean => {
    const ignoredPatterns = [
      'node_modules/',
      '.git/',
      'dist/',
      'build/',
      '.cache/',
      'coverage/',
      '.nyc_output/',
      'logs/',
      'tmp/',
      'temp/',
      '__pycache__/',
      '.pytest_cache/',
      'vendor/',
      '.vendor/',
      'bower_components/',
      '.sass-cache/'
    ];
    
    return ignoredPatterns.some(pattern => filePath.includes(pattern));
  }, []);

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `بیش از حد مجاز بزرگ است (${formatFileSize(MAX_FILE_SIZE)})` };
    }

    // Check if it's ignored
    const path = file.webkitRelativePath || file.name;
    if (shouldIgnoreFile(path)) {
      return { valid: false, error: 'فایل نادیده گرفته شده' };
    }

    // Check for dangerous files
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.com'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (dangerousExtensions.includes(extension)) {
      return { valid: false, error: 'نوع فایل امن نیست' };
    }

    return { valid: true };
  }, [shouldIgnoreFile]);

  const buildFileTree = useCallback((files: File[]): FileNode[] => {
    const tree: { [key: string]: FileNode } = {};
    
    files.forEach(file => {
      const relativePath = file.webkitRelativePath;
      if (!relativePath) return;
      
      const validation = validateFile(file);
      const pathParts = relativePath.split('/');
      let currentPath = '';
      
      pathParts.forEach((part, index) => {
        const isFile = index === pathParts.length - 1;
        const fullPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!tree[fullPath]) {
          tree[fullPath] = {
            name: part,
            path: fullPath,
            type: isFile ? 'file' : 'directory',
            size: isFile ? file.size : undefined,
            children: isFile ? undefined : [],
            file: isFile ? file : undefined,
            isValid: isFile ? validation.valid : undefined,
            error: isFile ? validation.error : undefined
          };
        }
        
        // Add to parent's children
        if (currentPath && tree[currentPath] && tree[currentPath].children) {
          const existsInChildren = tree[currentPath].children!.some(child => child.path === fullPath);
          if (!existsInChildren) {
            tree[currentPath].children!.push(tree[fullPath]);
          }
        }
        
        currentPath = fullPath;
      });
    });
    
    // Sort children: directories first, then files
    Object.values(tree).forEach(node => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      }
    });
    
    // Return root level nodes
    return Object.values(tree).filter(node => !node.path.includes('/'));
  }, [validateFile]);

  useEffect(() => {
    if (files.length > 0) {
      const tree = buildFileTree(files);
      setFileTree(tree);
      
      // Auto-expand root directory
      setExpandedNodes(new Set([directoryName]));
      
      // Select all valid files by default
      const defaultSelected = new Set<string>();
      files.forEach(file => {
        if (file.webkitRelativePath) {
          const validation = validateFile(file);
          if (validation.valid) {
            defaultSelected.add(file.webkitRelativePath);
          }
        }
      });
      setSelectedFiles(defaultSelected);
    }
  }, [files, directoryName, buildFileTree, validateFile]);

  const toggleExpand = (nodePath: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
    } else {
      newExpanded.add(nodePath);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleSelection = (node: FileNode) => {
    const newSelected = new Set(selectedFiles);
    
    if (node.type === 'file') {
      if (newSelected.has(node.path)) {
        newSelected.delete(node.path);
      } else {
        newSelected.add(node.path);
      }
    } else {
      // Directory selection - toggle all children
      const shouldSelect = !isNodeSelected(node);
      toggleDirectorySelection(node, newSelected, shouldSelect);
    }
    
    setSelectedFiles(newSelected);
  };

  const toggleDirectorySelection = (node: FileNode, selection: Set<string>, shouldSelect: boolean) => {
    if (node.type === 'file') {
      if (shouldSelect && node.isValid) {
        selection.add(node.path);
      } else {
        selection.delete(node.path);
      }
    } else if (node.children) {
      node.children.forEach(child => {
        toggleDirectorySelection(child, selection, shouldSelect);
      });
    }
  };

  const isNodeSelected = (node: FileNode): boolean => {
    if (node.type === 'file') {
      return selectedFiles.has(node.path);
    } else if (node.children) {
      const validChildren = node.children.filter(child => 
        child.type === 'directory' || child.isValid
      );
      return validChildren.length > 0 && validChildren.every(child => isNodeSelected(child));
    }
    return false;
  };

  const isNodePartiallySelected = (node: FileNode): boolean => {
    if (node.type === 'file') {
      return false;
    } else if (node.children) {
      const validChildren = node.children.filter(child => 
        child.type === 'directory' || child.isValid
      );
      const selectedChildren = validChildren.filter(child => isNodeSelected(child));
      const partialChildren = validChildren.filter(child => isNodePartiallySelected(child));
      return (selectedChildren.length > 0 || partialChildren.length > 0) && selectedChildren.length < validChildren.length;
    }
    return false;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredTree = useMemo(() => {
    if (!searchTerm && !showOnlyValid && !showOnlySelected) {
      return fileTree;
    }

    const filterNode = (node: FileNode): FileNode | null => {
      const matchesSearch = !searchTerm || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.path.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesValidFilter = !showOnlyValid || 
        node.type === 'directory' || 
        node.isValid;
      
      const matchesSelectedFilter = !showOnlySelected || 
        node.type === 'directory' || 
        selectedFiles.has(node.path);

      if (node.type === 'file') {
        return matchesSearch && matchesValidFilter && matchesSelectedFilter ? node : null;
      }

      // For directories, filter children
      const filteredChildren = node.children
        ?.map(child => filterNode(child))
        .filter((child): child is FileNode => child !== null) || [];

      if (filteredChildren.length > 0 || matchesSearch) {
        return {
          ...node,
          children: filteredChildren
        };
      }

      return null;
    };

    return fileTree
      .map(node => filterNode(node))
      .filter((node): node is FileNode => node !== null);
  }, [fileTree, searchTerm, showOnlyValid, showOnlySelected, selectedFiles]);

  const statistics = useMemo(() => {
    const selectedPaths = Array.from(selectedFiles);
    const selectedFilesData = files.filter(file => 
      file.webkitRelativePath && selectedPaths.includes(file.webkitRelativePath)
    );
    
    const totalSize = selectedFilesData.reduce((sum, file) => sum + file.size, 0);
    const validFiles = selectedFilesData.filter(file => validateFile(file).valid);
    
    return {
      totalFiles: files.length,
      selectedCount: selectedFilesData.length,
      validSelectedCount: validFiles.length,
      totalSize,
      overSizeLimit: totalSize > MAX_TOTAL_SIZE,
      sizePercentage: Math.round((totalSize / MAX_TOTAL_SIZE) * 100)
    };
  }, [files, selectedFiles, validateFile]);

  const handleConfirm = () => {
    const confirmedFiles = files.filter(file => 
      file.webkitRelativePath && selectedFiles.has(file.webkitRelativePath)
    );
    onConfirm(confirmedFiles);
  };

  const handleSelectAll = () => {
    const allValidFiles = new Set<string>();
    files.forEach(file => {
      if (file.webkitRelativePath && validateFile(file).valid) {
        allValidFiles.add(file.webkitRelativePath);
      }
    });
    setSelectedFiles(allValidFiles);
  };

  const handleDeselectAll = () => {
    setSelectedFiles(new Set());
  };

  const renderNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isSelected = isNodeSelected(node);
    const isPartial = isNodePartiallySelected(node);
    const isExpanded = expandedNodes.has(node.path);

    return (
      <div key={node.path}>
        <div 
          className="flex items-center py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors duration-150"
          style={{ paddingRight: `${level * 20 + 8}px` }}
        >
          {node.type === 'directory' && (
            <button 
              onClick={() => toggleExpand(node.path)}
              className="p-1 hover:bg-white/10 rounded mr-1 transition-colors duration-150"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3 text-white/60" />
              ) : (
                <ChevronRightIcon className="w-3 h-3 text-white/60" />
              )}
            </button>
          )}
          
          <button
            onClick={() => toggleSelection(node)}
            disabled={node.type === 'file' && !node.isValid}
            className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center transition-colors duration-150 ${
              isSelected 
                ? 'bg-blue-500 border-blue-500' 
                : isPartial 
                ? 'bg-blue-300 border-blue-400'
                : node.type === 'file' && !node.isValid
                ? 'border-red-400 bg-red-100 cursor-not-allowed opacity-50'
                : 'border-white/40 hover:border-white/60'
            }`}
          >
            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
            {isPartial && <div className="w-2 h-2 bg-blue-700 rounded-sm" />}
          </button>

          {node.type === 'directory' ? (
            <FolderIcon className="w-4 h-4 text-blue-400 mr-2" />
          ) : (
            <DocumentIcon className={`w-4 h-4 mr-2 ${
              node.isValid ? 'text-green-400' : 'text-red-400'
            }`} />
          )}

          <span className={`text-sm flex-1 ${
            node.type === 'file' && !node.isValid ? 'text-red-300' : 'text-white'
          }`}>
            {node.name}
          </span>
          
          {node.type === 'file' && (
            <div className="flex items-center space-x-2 space-x-reverse">
              {node.size && (
                <span className="text-xs text-white/50">
                  {formatFileSize(node.size)}
                </span>
              )}
              {!node.isValid && node.error && (
                <span className="text-xs text-red-400" title={node.error}>
                  ✗
                </span>
              )}
            </div>
          )}
        </div>

        {node.type === 'directory' && node.children && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-effect rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-xl font-semibold text-white">انتخاب فایل‌ها از {directoryName}</h2>
            <p className="text-white/60 text-sm mt-1">
              فایل‌هایی که می‌خواهید به پروژه اضافه کنید را انتخاب کنید
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <XMarkIcon className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-white/10 space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-white/40 absolute right-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="جستجو در فایل‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-9 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={() => setShowOnlyValid(!showOnlyValid)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  showOnlyValid 
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                }`}
              >
                فقط معتبر
              </button>
              
              <button
                onClick={() => setShowOnlySelected(!showOnlySelected)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                  showOnlySelected 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                }`}
              >
                فقط انتخاب شده
              </button>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-600/30 transition-colors duration-200"
              >
                انتخاب همه
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded text-sm hover:bg-red-600/30 transition-colors duration-200"
              >
                لغو انتخاب همه
              </button>
            </div>
            
            <div className="text-sm text-white/60">
              {statistics.selectedCount} از {statistics.totalFiles} فایل انتخاب شده
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">حجم انتخاب شده</span>
              <span className={`text-sm ${
                statistics.overSizeLimit ? 'text-red-400' : 'text-white/60'
              }`}>
                {formatFileSize(statistics.totalSize)} / {formatFileSize(MAX_TOTAL_SIZE)} 
                ({statistics.sizePercentage}%)
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  statistics.overSizeLimit ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(statistics.sizePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Warnings */}
          {statistics.overSizeLimit && (
            <div className="flex items-start p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-400 ml-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium text-sm">حجم بیش از حد مجاز</p>
                <p className="text-red-300 text-xs mt-1">
                  حجم انتخاب شده بیش از حد مجاز است. لطفاً تعدادی از فایل‌ها را حذف کنید.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* File Tree */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTree.length > 0 ? (
            <div className="space-y-1">
              {filteredTree.map(node => renderNode(node))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">
                {searchTerm || showOnlyValid || showOnlySelected 
                  ? 'هیچ فایلی با این فیلتر یافت نشد' 
                  : 'هیچ فایلی یافت نشد'
                }
              </p>
              {(searchTerm || showOnlyValid || showOnlySelected) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setShowOnlyValid(false);
                    setShowOnlySelected(false);
                  }}
                  className="mt-2 text-blue-400 hover:text-blue-300 text-sm underline"
                >
                  پاک کردن فیلترها
                </button>
              )}
            </div>
          )}
        </div>

        {/* Statistics Panel */}
        <div className="p-4 border-t border-white/10 bg-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-white">{statistics.totalFiles}</p>
              <p className="text-white/60 text-xs">کل فایل‌ها</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">{statistics.selectedCount}</p>
              <p className="text-white/60 text-xs">انتخاب شده</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-400">{statistics.validSelectedCount}</p>
              <p className="text-white/60 text-xs">معتبر</p>
            </div>
            <div>
              <p className={`text-lg font-bold ${
                statistics.overSizeLimit ? 'text-red-400' : 'text-purple-400'
              }`}>
                {formatFileSize(statistics.totalSize)}
              </p>
              <p className="text-white/60 text-xs">حجم کل</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-t border-white/20 space-y-4 sm:space-y-0">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 ml-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-white/70">
              <p className="font-medium">نکات مهم:</p>
              <ul className="text-xs text-white/50 mt-1 space-y-1">
                <li>• فایل‌های نامعتبر به صورت خودکار حذف می‌شوند</li>
                <li>• node_modules و فایل‌های بزرگ‌تر از {formatFileSize(MAX_FILE_SIZE)} شامل نمی‌شوند</li>
                <li>• حداکثر حجم کل: {formatFileSize(MAX_TOTAL_SIZE)}</li>
                <li>• ساختار پوشه‌ها حفظ می‌شود</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200 text-center"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              disabled={statistics.selectedCount === 0 || statistics.overSizeLimit}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg transition-all duration-200 font-medium text-center ${
                statistics.selectedCount === 0 || statistics.overSizeLimit
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
              title={
                statistics.selectedCount === 0 
                  ? 'هیچ فایلی انتخاب نشده است'
                  : statistics.overSizeLimit 
                  ? 'حجم انتخاب شده بیش از حد مجاز است'
                  : `${statistics.validSelectedCount} فایل معتبر اضافه خواهد شد`
              }
            >
              {statistics.selectedCount === 0 ? (
                'انتخاب فایل‌ها'
              ) : statistics.overSizeLimit ? (
                'حجم بیش از حد مجاز'
              ) : (
                `اضافه کردن (${statistics.validSelectedCount} فایل)`
              )}
            </button>
          </div>
        </div>

        {/* Additional Info Bar */}
        {statistics.selectedCount > 0 && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>
                آخرین به‌روزرسانی: {new Date().toLocaleTimeString('fa-IR')}
              </span>
              <span>
                {statistics.validSelectedCount} معتبر از {statistics.selectedCount} انتخاب شده
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileSelectionModal;