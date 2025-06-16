import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileTreeNode[];
  fileType?: string;
  analysis?: any;
  lastModified?: string;
}

interface FileTreeViewerProps {
  files: any[]; // Raw files from API
  onFileSelect?: (file: FileTreeNode) => void;
  selectedFileId?: string;
  className?: string;
}

const FileTreeViewer: React.FC<FileTreeViewerProps> = ({
  files,
  onFileSelect,
  selectedFileId,
  className = ""
}) => {
      const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

    const buildFileTree = useCallback((files: any[]): FileTreeNode[] => {
    const tree: { [key: string]: FileTreeNode } = {};
    

    
    files.forEach(file => {
      const pathParts = file.path.split('/').filter(Boolean);
      let currentPath = '';
      
      // Handle root level files (no slash in path)
      if (pathParts.length === 1) {
        // This is a root level file
        tree[file.path] = {
          id: file.id,
          name: file.name,
          path: file.path,
          type: 'file',
          size: parseInt(file.size?.toString() || '0'),
          children: undefined,
          fileType: file.type,
          analysis: file.analysis,
          lastModified: file.updatedAt
        };
        return;
      }
      
      // Handle nested files
      pathParts.forEach((part: string, index: number) => {
        const isFile = index === pathParts.length - 1;
        const fullPath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!tree[fullPath]) {
          tree[fullPath] = {
            id: isFile ? file.id : `dir_${fullPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: part,
            path: fullPath,
            type: isFile ? 'file' : 'directory',
            size: isFile ? parseInt(file.size?.toString() || '0') : undefined,
            children: isFile ? undefined : [],
            fileType: isFile ? file.type : undefined,
            analysis: isFile ? file.analysis : undefined,
            lastModified: isFile ? file.updatedAt : undefined
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
    const rootNodes = Object.values(tree).filter(node => !node.path.includes('/'));
    

    return rootNodes;
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      const tree = buildFileTree(files);
      setFileTree(tree);
      
      // Auto-expand first level directories
      const firstLevelDirs = tree
        .filter(node => node.type === 'directory')
        .map(node => node.path);
      setExpandedNodes(new Set(firstLevelDirs));
    }
  }, [files, buildFileTree]);

  const toggleExpand = (nodePath: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
    } else {
      newExpanded.add(nodePath);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: FileTreeNode) => {
    if (node.type === 'directory') {
      toggleExpand(node.path);
    } else {
      onFileSelect?.(node);
    }
  };

  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return CodeBracketIcon;
      case 'json':
      case 'html':
      case 'css':
      case 'scss':
      case 'md':
        return DocumentIcon;
      default:
        return DocumentIcon;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderNode = (node: FileTreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.path);
    const isSelected = selectedFileId === node.id;
    const Icon = node.type === 'directory' 
      ? (isExpanded ? FolderOpenIcon : FolderIcon)
      : getFileIcon(node.name, node.fileType);

    return (
      <div key={node.id || node.path}>
        <div
          className={`flex items-center py-1 px-2 hover:bg-white/10 rounded cursor-pointer transition-colors duration-150 ${
            isSelected ? 'bg-blue-500/30' : ''
          }`}
          style={{ paddingRight: `${level * 16 + 8}px` }}
          onClick={() => handleNodeClick(node)}
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
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={className}>
      {fileTree.length > 0 ? (
        <div className="space-y-1">
          {fileTree.map(node => renderNode(node))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FolderIcon className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60 text-sm">هیچ فایلی موجود نیست</p>
        </div>
      )}
    </div>
  );
};

export default FileTreeViewer; 