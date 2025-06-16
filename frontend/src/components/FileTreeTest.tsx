import React from 'react';
import FileTreeViewer from './FileTreeViewer';

const mockFiles = [
  {
    id: '1',
    path: 'package.json',
    name: 'package.json',
    type: 'JSON',
    size: 500,
    updatedAt: '2024-06-16T09:00:00Z'
  },
  {
    id: '2', 
    path: 'src/index.js',
    name: 'index.js',
    type: 'JAVASCRIPT',
    size: 200,
    updatedAt: '2024-06-16T09:00:00Z'
  },
  {
    id: '3',
    path: 'src/components/Header.js', 
    name: 'Header.js',
    type: 'JAVASCRIPT',
    size: 300,
    updatedAt: '2024-06-16T09:00:00Z'
  },
  {
    id: '4',
    path: 'src/utils/helpers.js',
    name: 'helpers.js', 
    type: 'JAVASCRIPT',
    size: 150,
    updatedAt: '2024-06-16T09:00:00Z'
  },
  {
    id: '5',
    path: 'public/index.html',
    name: 'index.html',
    type: 'HTML', 
    size: 400,
    updatedAt: '2024-06-16T09:00:00Z'
  }
];

const FileTreeTest: React.FC = () => {
  const handleFileSelect = (file: any) => {
    console.log('Selected file:', file);
  };

  return (
    <div className="glass-card max-w-md">
      <h3 className="text-white text-lg mb-4">File Tree Test</h3>
      <FileTreeViewer 
        files={mockFiles}
        onFileSelect={handleFileSelect}
        selectedFileId="1"
      />
    </div>
  );
};

export default FileTreeTest; 