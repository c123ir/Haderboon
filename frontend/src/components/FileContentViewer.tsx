// components/FileContentViewer.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

interface FileContent {
  name: string;
  content: string;
  path: string;
  size: number;
  lastModified: string;
  type: string;
}

interface FileContentViewerProps {
  file: FileContent | null;
  onClose?: () => void;
  className?: string;
}

const FileContentViewer: React.FC<FileContentViewerProps> = ({
  file,
  onClose,
  className = ''
}) => {
  const [isRTL, setIsRTL] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState(false);

  // Reset states when file changes
  useEffect(() => {
    setIsRTL(false);
    setIsFullscreen(false);
    setCopied(false);
  }, [file]);

  const copyToClipboard = async () => {
    if (file?.content) {
      try {
        await navigator.clipboard.writeText(file.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy content:', err);
      }
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'ts': return 'typescript';
      case 'tsx': return 'typescript';
      case 'js': return 'javascript';
      case 'jsx': return 'javascript';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'scss': return 'scss';
      case 'sass': return 'sass';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'sql': return 'sql';
      case 'xml': return 'xml';
      case 'yaml': case 'yml': return 'yaml';
      default: return 'text';
    }
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getContentLines = (content: string): string[] => {
    return content.split('\n');
  };

  const renderLineNumbers = (lineCount: number): React.ReactNode => {
    if (!showLineNumbers) return null;
    
    return (
      <div className="bg-gray-800/50 border-l border-white/10 min-w-[4rem] p-4 select-none" dir="ltr">
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i + 1}
            className="text-white/40 text-sm font-mono leading-6 text-right"
          >
            {i + 1}
          </div>
        ))}
      </div>
    );
  };

  const renderSyntaxHighlightedContent = (content: string): React.ReactNode => {
    const lines = getContentLines(content);
    const language = file ? getLanguageFromExtension(file.name) : 'text';
    
    // Basic syntax highlighting for common patterns
    const highlightLine = (line: string, lineNumber: number): React.ReactNode => {
      // This is a basic implementation. For production, consider using a library like Prism.js or highlight.js
      let highlightedLine = line;
      
      // Keywords highlighting (basic)
      if (['typescript', 'javascript'].includes(language)) {
        highlightedLine = highlightedLine
          .replace(/\b(const|let|var|function|class|interface|type|export|import|default|async|await|return|if|else|for|while|try|catch|finally)\b/g, '<span class="text-purple-400 font-semibold">$1</span>')
          .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
          .replace(/(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="text-green-400">$1$2$1</span>')
          .replace(/\/\/.*$/g, '<span class="text-gray-500 italic">$&</span>')
          .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500 italic">$&</span>');
      }
      
      if (language === 'json') {
        highlightedLine = highlightedLine
          .replace(/(".*?")\s*:/g, '<span class="text-blue-400">$1</span>:')
          .replace(/:\s*(".*?")/g, ': <span class="text-green-400">$1</span>')
          .replace(/:\s*(\d+)/g, ': <span class="text-orange-400">$1</span>')
          .replace(/:\s*(true|false|null)/g, ': <span class="text-purple-400">$1</span>');
      }
      
      return (
        <div
          key={lineNumber}
          className="leading-6 font-mono text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
        />
      );
    };

    return (
      <div className="flex-1 p-4 overflow-auto">
        {lines.map((line, index) => highlightLine(line, index))}
      </div>
    );
  };

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center text-white/60">
          <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">فایلی انتخاب نشده</p>
          <p className="text-sm">برای مشاهده محتوا، فایلی از درخت انتخاب کنید</p>
        </div>
      </div>
    );
  }

  const lines = getContentLines(file.content);
  const language = getLanguageFromExtension(file.name);

  return (
    <div className={`flex flex-col h-full bg-gray-900/50 ${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-800/30">
        <div className="flex items-center space-x-3 space-x-reverse">
          <DocumentTextIcon className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-white font-medium">{file.name}</h3>
            <p className="text-white/60 text-sm">
              {file.path} • {formatFileSize(file.size)} • {language}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            onClick={() => setIsRTL(!isRTL)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
            title={isRTL ? 'تغییر به LTR' : 'تغییر به RTL'}
          >
            <LanguageIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
            title={showLineNumbers ? 'مخفی کردن شماره خطوط' : 'نمایش شماره خطوط'}
          >
            {showLineNumbers ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={copyToClipboard}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
            title="کپی محتوا"
          >
            <ClipboardDocumentIcon className={`w-4 h-4 ${copied ? 'text-green-400' : ''}`} />
          </button>
          
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
            title={isFullscreen ? 'خروج از تمام صفحه' : 'نمایش تمام صفحه'}
          >
            {isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 text-white/60 hover:text-white"
              title="بستن"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="px-4 py-2 bg-gray-800/20 border-b border-white/5 text-white/60 text-xs">
        آخرین تغییر: {formatDate(file.lastModified)} • خطوط: {lines.length}
        {copied && <span className="text-green-400 mr-4">✓ کپی شد</span>}
      </div>

      {/* Content */}
      <div className={`flex-1 flex overflow-hidden ${isRTL ? 'flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {renderLineNumbers(lines.length)}
        <div className="flex-1 overflow-auto text-white">
          {renderSyntaxHighlightedContent(file.content)}
        </div>
      </div>
    </div>
  );
};

export default FileContentViewer;