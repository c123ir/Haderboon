// components/FileTree.tsx - اگر این فایل موجود نیست
import React, { useState, useMemo } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  CodeBracketIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

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

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string | null;
  onFileSelect: (file: FileNode) => void;
  className?: string;
}

const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedFile,
  onFileSelect,
  className = ''
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'directory') {
      return expandedFolders.has(file.path) ? 
        <FolderOpenIcon className="w-4 h-4 text-blue-400" /> :
        <FolderIcon className="w-4 h-4 text-blue-400" />;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <CodeBracketIcon className="w-4 h-4 text-yellow-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <PhotoIcon className="w-4 h-4 text-purple-500" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const buildTree = (flatFiles: FileNode[]): FileNode[] => {
    // Simple implementation - just return the files as-is for now
    return flatFiles.filter(file => !file.path.includes('/'));
  };

  const treeData = useMemo(() => buildTree(files), [files]);

  const renderNode = (node: FileNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={`${node.id}-${node.path}-${depth}`}>
        <div
          className={`
            flex items-center cursor-pointer hover:bg-white/5 transition-colors duration-150 py-1
            ${isSelected ? 'bg-blue-500/20 border-r-2 border-blue-400' : ''}
          `}
          style={{ paddingLeft: `${paddingLeft}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleFolder(node.path);
            } else {
              onFileSelect(node);
            }
          }}
        >
          {node.type === 'directory' && (
            <button className="p-1">
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3 text-white/60" />
              ) : (
                <ChevronRightIcon className="w-3 h-3 text-white/60" />
              )}
            </button>
          )}
          
          <div className="flex items-center flex-1 px-2 min-w-0">
            {getFileIcon(node)}
            <span className="text-white text-sm ml-2 truncate">
              {node.name}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`overflow-auto h-full ${className}`} dir="ltr">
      <div className="p-2">
        {treeData.map(node => renderNode(node))}
      </div>
    </div>
  );
};

export default FileTree;