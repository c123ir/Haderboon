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
    console.log('🌳 Building file tree from', files.length, 'files');
    console.log('📄 Sample files:', files.slice(0, 3).map(f => ({ path: f.path, name: f.name, type: f.type })));

    const tree: { [key: string]: FileTreeNode } = {};

    files.forEach(file => {
      console.log('📁 Processing file:', file.path);
      
      const fullPath = file.path;
      const pathParts = fullPath.split('/').filter(Boolean);
      
      // Build all parent directories first
      let currentPath = '';
      
      pathParts.forEach((part: string, index: number) => {
        const isLastPart = index === pathParts.length - 1;
        const nodePath = currentPath ? `${currentPath}/${part}` : part;
        
        if (!tree[nodePath]) {
          tree[nodePath] = {
            id: isLastPart ? file.id : `dir_${nodePath.replace(/[^a-zA-Z0-9]/g, '_')}`,
            name: part,
            path: nodePath,
            type: isLastPart ? 'file' : 'directory',
            size: isLastPart ? parseInt(file.size?.toString() || '0') : undefined,
            children: isLastPart ? undefined : [],
            fileType: isLastPart ? file.type : undefined,
            analysis: isLastPart ? file.analysis : undefined,
            lastModified: isLastPart ? file.updatedAt : undefined
          };
          
          console.log(`📂 Created ${isLastPart ? 'file' : 'directory'}: ${nodePath}`);
        }
        
        // Add to parent's children if this is not root
        if (currentPath && tree[currentPath] && tree[currentPath].children) {
          const parentNode = tree[currentPath];
          const existsInChildren = parentNode.children!.some(child => child.path === nodePath);
          
          if (!existsInChildren) {
            parentNode.children!.push(tree[nodePath]);
            console.log(`➡️ Added ${nodePath} to parent ${currentPath}`);
          }
        }
        
        currentPath = nodePath;
      });
    });

    // Sort all children
    Object.values(tree).forEach(node => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
      }
    });

    // Find root nodes (those that are not children of any other node)
    const allPaths = new Set(Object.keys(tree));
    const childPaths = new Set<string>();
    
    Object.values(tree).forEach(node => {
      if (node.children) {
        node.children.forEach(child => {
          childPaths.add(child.path);
        });
      }
    });

    const rootNodes = Object.values(tree).filter(node => !childPaths.has(node.path));
    
    console.log('🌲 Built tree with', Object.keys(tree).length, 'total nodes');
    console.log('🌿 Root nodes:', rootNodes.length, rootNodes.map(n => n.path));
    
    return rootNodes;
  }, []);

  useEffect(() => {
    if (files.length > 0) {
      console.log('🔄 Files updated, rebuilding tree...');
      const tree = buildFileTree(files);
      setFileTree(tree);
      
      // Auto-expand first level directories
      const firstLevelDirs = tree
        .filter(node => node.type === 'directory')
        .map(node => node.path);
      
      console.log('📂 Auto-expanding directories:', firstLevelDirs);
      setExpandedNodes(new Set(firstLevelDirs));
    } else {
      console.log('❌ No files provided');
      setFileTree([]);
    }
  }, [files, buildFileTree]);

  const toggleExpand = (nodePath: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodePath)) {
      newExpanded.delete(nodePath);
      console.log('🔽 Collapsed:', nodePath);
    } else {
      newExpanded.add(nodePath);
      console.log('🔼 Expanded:', nodePath);
    }
    setExpandedNodes(newExpanded);
  };

  const handleNodeClick = (node: FileTreeNode) => {
    if (node.type === 'directory') {
      toggleExpand(node.path);
    } else {
      console.log('📄 File selected:', node.path);
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

  console.log('🎨 Rendering FileTreeViewer with', fileTree.length, 'root nodes');

  return (
    <div className={className}>
      {fileTree.length > 0 ? (
        <div className="space-y-1">
          {fileTree.map(node => renderNode(node))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FolderIcon className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60 text-sm">
            {files.length > 0 ? 'در حال ساخت ساختار فایل...' : 'هیچ فایلی موجود نیست'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileTreeViewer; 