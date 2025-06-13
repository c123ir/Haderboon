import React, { useState, useEffect, useCallback } from 'react';
import { 
  XMarkIcon, 
  FolderIcon, 
  DocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
  file?: File;
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
  const [projectCapacity, setProjectCapacity] = useState(0);

  useEffect(() => {
    if (files.length > 0) {
      const tree = buildFileTree(files);
      setFileTree(tree);
      
      // Auto-expand root directory
      setExpandedNodes(new Set([directoryName]));
      
      // Select all files by default (except ignored ones)
      const defaultSelected = new Set<string>();
      files.forEach(file => {
        if (file.webkitRelativePath && !shouldIgnoreFile(file.webkitRelativePath)) {
          defaultSelected.add(file.webkitRelativePath);
        }
      });
      setSelectedFiles(defaultSelected);
      
      // Calculate project capacity
      const totalSize = Array.from(defaultSelected).reduce((sum, path) => {
        const file = files.find(f => f.webkitRelativePath === path);
        return sum + (file?.size || 0);
      }, 0);
      setProjectCapacity(Math.round((totalSize / (100 * 1024 * 1024)) * 100)); // Assuming 100MB limit
    }
  }, [files, directoryName]);

  const shouldIgnoreFile = (filePath: string): boolean => {
    const ignoredPatterns = [
      'node_modules/'
    ];
    
    return ignoredPatterns.some(pattern => filePath.includes(pattern));
  };

  const buildFileTree = (files: File[]): FileNode[] => {
    const tree: { [key: string]: FileNode } = {};
    
    files.forEach(file => {
      const relativePath = file.webkitRelativePath;
      if (!relativePath || shouldIgnoreFile(relativePath)) return;
      
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
            file: isFile ? file : undefined
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
    
    // Return root level nodes
    return Object.values(tree).filter(node => !node.path.includes('/'));
  };

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
    updateProjectCapacity(newSelected);
  };

  const toggleDirectorySelection = (node: FileNode, selection: Set<string>, shouldSelect: boolean) => {
    if (node.type === 'file') {
      if (shouldSelect) {
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
      return node.children.every(child => isNodeSelected(child));
    }
    return false;
  };

  const isNodePartiallySelected = (node: FileNode): boolean => {
    if (node.type === 'file') {
      return false;
    } else if (node.children) {
      const selectedChildren = node.children.filter(child => isNodeSelected(child));
      const partialChildren = node.children.filter(child => isNodePartiallySelected(child));
      return (selectedChildren.length > 0 || partialChildren.length > 0) && selectedChildren.length < node.children.length;
    }
    return false;
  };

  const updateProjectCapacity = (selection: Set<string>) => {
    const totalSize = Array.from(selection).reduce((sum, path) => {
      const file = files.find(f => f.webkitRelativePath === path);
      return sum + (file?.size || 0);
    }, 0);
    setProjectCapacity(Math.round((totalSize / (100 * 1024 * 1024)) * 100)); // Assuming 100MB limit
  };

  const handleConfirm = () => {
    const confirmedFiles = files.filter(file => 
      file.webkitRelativePath && selectedFiles.has(file.webkitRelativePath)
    );
    onConfirm(confirmedFiles);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderNode = (node: FileNode, level: number = 0): React.ReactNode => {
    const isSelected = isNodeSelected(node);
    const isPartial = isNodePartiallySelected(node);
    const isExpanded = expandedNodes.has(node.path);

    return (
      <div key={node.path}>
        <div 
          className="flex items-center py-1 px-2 hover:bg-gray-100 rounded cursor-pointer"
          style={{ paddingRight: `${level * 20 + 8}px` }}
        >
          {node.type === 'directory' && (
            <button 
              onClick={() => toggleExpand(node.path)}
              className="p-1 hover:bg-gray-200 rounded mr-1"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRightIcon className="w-3 h-3 text-gray-600" />
              )}
            </button>
          )}
          
          <button
            onClick={() => toggleSelection(node)}
            className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center ${
              isSelected 
                ? 'bg-blue-500 border-blue-500' 
                : isPartial 
                ? 'bg-gray-300 border-gray-400'
                : 'border-gray-300'
            }`}
          >
            {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
            {isPartial && <div className="w-2 h-2 bg-gray-600 rounded-sm" />}
          </button>

          {node.type === 'directory' ? (
            <FolderIcon className="w-4 h-4 text-blue-500 mr-2" />
          ) : (
            <DocumentIcon className="w-4 h-4 text-gray-500 mr-2" />
          )}

          <span className="text-sm text-gray-800 flex-1">{node.name}</span>
          
          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-500 mr-2">
              {formatFileSize(node.size)}
            </span>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col border border-white border-opacity-30">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 border-opacity-50 bg-white bg-opacity-50">
          <h2 className="text-xl font-semibold text-gray-800">انتخاب محتوا از {directoryName}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 hover:bg-opacity-60 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 border-opacity-50 bg-white bg-opacity-30">
            <p className="text-sm text-gray-600 mb-2">
              فایل‌هایی که می‌خواهید به این پروژه اضافه کنید را انتخاب کنید
            </p>
            
            {/* Progress bar */}
            <div className="flex items-center space-x-reverse space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(projectCapacity, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600 min-w-fit">
                {projectCapacity}% از ظرفیت پروژه استفاده شده
              </span>
            </div>
          </div>

          {/* File tree */}
          <div className="flex-1 overflow-y-auto p-4">
            {fileTree.map(node => renderNode(node))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 border-opacity-50 bg-white bg-opacity-50">
          <div className="text-sm text-gray-600">
            {selectedFiles.size} فایل انتخاب شده | {projectCapacity}% از ظرفیت استفاده شده
          </div>
          <div className="flex space-x-reverse space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 hover:bg-opacity-60 rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 bg-blue-600 bg-opacity-90 text-white rounded-lg hover:bg-blue-700 hover:bg-opacity-95 transition-colors backdrop-blur-sm"
            >
              اضافه کردن فایل‌ها
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSelectionModal; 