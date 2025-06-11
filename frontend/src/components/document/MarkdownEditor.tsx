// frontend/src/components/document/MarkdownEditor.tsx
// کامپوننت ویرایشگر Markdown برای مستندات

import React, { useState, useEffect } from 'react';
import 'highlight.js/styles/github.css';

interface MarkdownEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

/**
 * کامپوننت ویرایشگر Markdown
 */
const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  onChange,
  placeholder = 'متن خود را به فرمت Markdown وارد کنید...',
  readOnly = false,
  height = '400px'
}) => {
  const [content, setContent] = useState(initialValue);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  // تبدیل Markdown به HTML
  const renderMarkdown = () => {
    if (typeof window !== 'undefined') {
      // استفاده از ماژول به صورت dynamic برای جلوگیری از خطا در SSR
      try {
        const marked = require('marked');
        return { __html: marked.parse(content) };
      } catch (error) {
        console.error('خطا در پردازش Markdown:', error);
        return { __html: '<div>خطا در پردازش محتوا</div>' };
      }
    }
    return { __html: '' };
  };

  return (
    <div className="flex flex-col space-y-2 w-full">
      <div className="flex justify-between items-center pb-2 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-500">
          {preview ? 'پیش‌نمایش' : 'ویرایش'}
        </div>
        <div>
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200"
          >
            {preview ? 'ویرایش' : 'پیش‌نمایش'}
          </button>
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: height }}>
        {preview ? (
          <div
            className="w-full h-full p-4 prose prose-slate max-w-none overflow-auto"
            dir="auto"
            dangerouslySetInnerHTML={renderMarkdown()}
          />
        ) : (
          <textarea
            value={content}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={readOnly}
            className="w-full h-full p-4 resize-none border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            dir="auto"
            style={{ minHeight: height }}
          />
        )}
      </div>
      
      {!preview && (
        <div className="text-xs text-gray-500 pt-2">
          برای فرمت‌دهی از Markdown استفاده کنید. برای راهنمایی به 
          <a 
            href="https://docs.github.com/en/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax" 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-500 hover:underline mx-1"
          >
            راهنمای Markdown
          </a>
          مراجعه کنید.
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor; 