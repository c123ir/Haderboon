// components/FileTree.tsx
import React, { useState, useMemo } from 'react';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  CodeBracketIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  ArchiveBoxIcon,
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

  // Auto-expand root level folders
  React.useEffect(() => {
    const rootFolders = files
      .filter(file => file.type === 'directory')
      .map(folder => folder.path);
    setExpandedFolders(new Set(rootFolders));
  }, [files]);

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
        return <CodeBracketIcon className="w-4 h-4 text-blue-500" />;
      case 'js':
      case 'jsx':
        return <CodeBracketIcon className="w-4 h-4 text-yellow-500" />;
      case 'html':
        return <CodeBracketIcon className="w-4 h-4 text-orange-500" />;
      case 'css':
      case 'scss':
      case 'sass':
        return <CodeBracketIcon className="w-4 h-4 text-pink-500" />;
      case 'json':
        return <CodeBracketIcon className="w-4 h-4 text-green-500" />;
      case 'md':
      case 'txt':
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return <PhotoIcon className="w-4 h-4 text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <MusicalNoteIcon className="w-4 h-4 text-green-600" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <VideoCameraIcon className="w-4 h-4 text-red-500" />;
      case 'zip':
      case 'rar':
      case 'tar':
        return <ArchiveBoxIcon className="w-4 h-4 text-orange-600" />;
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getFileSize = (size?: number) => {
    if (!size) return '';
    
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const buildTree = (flatFiles: FileNode[]): FileNode[] => {
    const tree: FileNode[] = [];
    const map = new Map<string, FileNode>();

    // Create all nodes
    flatFiles.forEach(file => {
      const node: FileNode = {
        ...file,
        children: file.type === 'directory' ? [] : undefined
      };
      map.set(file.path, node);
    });

    // Build hierarchy
    flatFiles.forEach(file => {
      const node = map.get(file.path)!;
      const pathParts = file.path.split('/').filter(Boolean);
      
      if (pathParts.length === 1) {
        // Root level
        tree.push(node);
      } else {
        // Find parent
        const parentPath = pathParts.slice(0, -1).join('/');
        const parent = map.get(parentPath);
        if (parent && parent.children) {
          parent.children.push(node);
        }
      }
    });

    return tree;
  };

  const treeData = useMemo(() => buildTree(files), [files]);

  const renderNode = (node: FileNode, depth = 0): React.ReactNode => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const paddingLeft = depth * 16 + 8;

    return (
      <div key={node.path}>
        <div
          className={`
            flex items-center cursor-pointer hover:bg-white/5 transition-colors duration-150
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
            <button
              className="p-1 hover:bg-white/10 rounded"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(node.path);
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-3 h-3 text-white/60" />
              ) : (
                <ChevronRightIcon className="w-3 h-3 text-white/60" />
              )}
            </button>
          )}
          
          <div className="flex items-center flex-1 py-1 px-2 min-w-0">
            {getFileIcon(node)}
            <span className="text-white text-sm ml-2 truncate flex-1">
              {node.name}
            </span>
            {node.size && (
              <span className="text-white/40 text-xs ml-auto">
                {getFileSize(node.size)}
              </span>
            )}
          </div>
        </div>

        {node.type === 'directory' && isExpanded && node.children && (
          <div>
            {node.children
              .sort((a, b) => {
                // Directories first, then files
                if (a.type !== b.type) {
                  return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`overflow-auto h-full ${className}`} dir="ltr">
      <div className="p-2">
        {treeData
          .sort((a, b) => {
            // Directories first, then files
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          })
          .map(node => renderNode(node))}
      </div>
    </div>
  );
};

export default FileTree;