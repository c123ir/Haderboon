// frontend/src/pages/PromptGeneratorPage.tsx

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  SparklesIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  EyeIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { getProjectById, mockFileTree } from '../utils/mockData';
import { PromptRequest } from '../types';

const PromptGeneratorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || '');
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  
  const [promptRequest, setPromptRequest] = useState<PromptRequest>({
    requirement: '',
    includeFiles: [],
    excludeFiles: [],
    focusAreas: [],
    outputType: 'code',
  });

  const outputTypes = [
    { id: 'code', label: 'کد', icon: CodeBracketIcon, description: 'تولید یا بهبود کد' },
    { id: 'documentation', label: 'مستندات', icon: DocumentTextIcon, description: 'نوشتن مستندات' },
    { id: 'analysis', label: 'تحلیل', icon: ChartBarIcon, description: 'تحلیل کد یا معماری' },
    { id: 'other', label: 'سایر', icon: CogIcon, description: 'سایر موارد' },
  ];

  const focusAreaOptions = [
    'Performance بهینه‌سازی',
    'Security امنیت',
    'Code Quality کیفیت کد',
    'User Experience تجربه کاربری',
    'Testing تست‌ها',
    'Documentation مستندسازی',
    'Refactoring بازسازی',
    'Bug Fixing رفع باگ',
  ];

  const handleGeneratePrompt = async () => {
    if (!promptRequest.requirement.trim()) {
      alert('لطفاً نیاز خود را توضیح دهید');
      return;
    }

    setIsGenerating(true);
    
    // Simulate prompt generation
    setTimeout(() => {
      const prompt = `## Context (بستر پروژه)
شما در حال کار روی پروژه "${project?.name}" هستید که با تکنولوژی‌های React و TypeScript توسعه یافته است.

### ساختار پروژه:
\`\`\`
${mockFileTree.map(node => `${node.name}/`).join('\n')}
\`\`\`

### فایل‌های مرتبط:
${(promptRequest.includeFiles || []).length > 0 
  ? (promptRequest.includeFiles || []).map(file => `- ${file}`).join('\n')
  : '- تمام فایل‌های پروژه در نظر گرفته شود'
}

## درخواست (Requirement)
${promptRequest.requirement}

## نوع خروجی مورد انتظار
${outputTypes.find(type => type.id === promptRequest.outputType)?.label}

## نکات و محدودیت‌ها
${(promptRequest.focusAreas || []).length > 0 
  ? `- تمرکز ویژه روی: ${(promptRequest.focusAreas || []).join(', ')}`
  : ''
}
- از TypeScript استفاده کنید
- کد باید قابل نگهداری و خوانا باشد
- Best practices را رعایت کنید
- کامنت‌های مناسب اضافه کنید

## مثال (اختیاری)
لطفاً پاسخ خود را با توضیحات کامل و مثال‌های عملی ارائه دهید.`;

      setGeneratedPrompt(prompt);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleFileInclusion = (filePath: string) => {
    setPromptRequest(prev => ({
      ...prev,
      includeFiles: (prev.includeFiles || []).includes(filePath)
        ? (prev.includeFiles || []).filter(f => f !== filePath)
        : [...(prev.includeFiles || []), filePath]
    }));
  };

  const toggleFocusArea = (area: string) => {
    setPromptRequest(prev => ({
      ...prev,
      focusAreas: (prev.focusAreas || []).includes(area)
        ? (prev.focusAreas || []).filter(a => a !== area)
        : [...(prev.focusAreas || []), area]
    }));
  };

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">پروژه یافت نشد</h2>
        <Link to="/projects" className="text-blue-400 hover:text-blue-300">
          بازگشت به پروژه‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to={`/projects/${project.id}`}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ml-3"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">
                تولید پرامپت - {project.name}
              </h1>
              <p className="text-white/60 text-sm">
                پرامپت بهینه برای هوش مصنوعی بسازید
              </p>
            </div>
          </div>
          <SparklesIcon className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          {/* Requirement */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              نیاز خود را توضیح دهید *
            </h3>
            <textarea
              value={promptRequest.requirement}
              onChange={(e) => setPromptRequest(prev => ({ ...prev, requirement: e.target.value }))}
              placeholder="مثال: می‌خوام یک کامپوننت جستجو برای لیست محصولات بسازم که قابلیت فیلتر کردن و sorting داشته باشه..."
              rows={6}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none"
            />
          </div>

          {/* Output Type */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">نوع خروجی مورد انتظار</h3>
            <div className="grid grid-cols-2 gap-3">
              {outputTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setPromptRequest(prev => ({ ...prev, outputType: type.id as any }))}
                    className={`p-4 rounded-lg border transition-colors duration-200 text-right ${
                      promptRequest.outputType === type.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-6 h-6 mb-2" />
                    <h4 className="font-medium">{type.label}</h4>
                    <p className="text-xs mt-1 opacity-80">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Focus Areas */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">حوزه‌های تمرکز (اختیاری)</h3>
            <div className="flex flex-wrap gap-2">
              {focusAreaOptions.map((area) => (
                <button
                  key={area}
                  onClick={() => toggleFocusArea(area)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                    promptRequest.focusAreas.includes(area)
                      ? 'bg-blue-600/20 border border-blue-500 text-blue-300'
                      : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* File Selection */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">فایل‌های مرتبط (اختیاری)</h3>
            <p className="text-white/60 text-sm mb-3">
              فایل‌هایی که باید در context پرامپت باشند را انتخاب کنید
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {mockFileTree.map((node) => (
                <div key={node.id}>
                  {node.children?.map((file) => (
                    <label
                      key={file.id}
                      className="flex items-center p-2 hover:bg-white/5 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={promptRequest.includeFiles.includes(file.path)}
                        onChange={() => toggleFileInclusion(file.path)}
                        className="mr-3 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-white/70 text-sm">{file.path}</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePrompt}
            disabled={isGenerating || !promptRequest.requirement.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                در حال تولید پرامپت...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 ml-2" />
                تولید پرامپت
              </>
            )}
          </button>
        </div>

        {/* Generated Prompt */}
        <div className="space-y-6">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">پرامپت تولید شده</h3>
              {generatedPrompt && (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {copied ? (
                      <CheckIcon className="w-4 h-4 ml-2" />
                    ) : (
                      <DocumentDuplicateIcon className="w-4 h-4 ml-2" />
                    )}
                    {copied ? 'کپی شد!' : 'کپی'}
                  </button>
                </div>
              )}
            </div>
            
            {generatedPrompt ? (
              <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                <pre className="text-white/90 text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                  {generatedPrompt}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12">
                <SparklesIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
                <p className="text-white/60">
                  پرامپت شما پس از تکمیل فرم و کلیک روی دکمه تولید اینجا نمایش داده خواهد شد
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4">نکات مفید:</h3>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start">
                <span className="text-purple-400 ml-2">•</span>
                نیاز خود را واضح و مفصل توضیح دهید
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 ml-2">•</span>
                فایل‌های مرتبط را انتخاب کنید تا context بهتری داشته باشید
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 ml-2">•</span>
                حوزه‌های تمرکز کمک می‌کند تا پاسخ دقیق‌تری دریافت کنید
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 ml-2">•</span>
                پرامپت تولید شده را در ChatGPT، Claude یا Cursor کپی کنید
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptGeneratorPage;