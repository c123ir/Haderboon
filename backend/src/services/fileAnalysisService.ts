// backend/src/services/fileAnalysisService.ts

import fs from 'fs';
import path from 'path';
import { FileAnalysisResult, ProjectAnalysisResult } from '../types';
import { getFileType, getFileExtension } from '../utils';

/**
 * Analyze a single file and extract metadata
 */
export const analyzeFile = async (filePath: string): Promise<FileAnalysisResult> => {
  try {
    const stats = fs.statSync(filePath);
    const extension = getFileExtension(filePath);
    const fileType = getFileType(filePath);
    
    let content = '';
    let analysis: FileAnalysisResult = {
      lines: 0,
      complexity: 1,
      language: fileType,
      summary: 'فایل قابل تحلیل نیست'
    };

    // Read text files for analysis
    const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.html', '.css', '.scss', '.json', '.md', '.txt'];
    
    if (textExtensions.includes(extension) && stats.size < 1024 * 1024) { // Max 1MB for text analysis
      try {
        content = fs.readFileSync(filePath, 'utf8');
        analysis = analyzeTextFile(content, extension);
      } catch (error) {
        console.warn(`خطا در خواندن فایل ${filePath}:`, error);
      }
    }

    return {
      ...analysis,
      lines: content ? content.split('\n').length : 0
    };
  } catch (error) {
    console.error('خطا در تحلیل فایل:', error);
    return {
      complexity: 1,
      lines: 0,
      summary: 'خطا در تحلیل فایل',
      language: 'OTHER'
    };
  }
};

/**
 * Analyze text file content based on file type
 */
const analyzeTextFile = (content: string, extension: string): FileAnalysisResult => {
  const lines = content.split('\n');
  const analysis: FileAnalysisResult = {
    functions: [],
    classes: [],
    imports: [],
    exports: [],
    dependencies: [],
    complexity: 1,
    lines: lines.length,
    language: getLanguageFromExtension(extension),
    summary: ''
  };

  switch (extension) {
    case '.js':
    case '.ts':
    case '.jsx':
    case '.tsx':
      return analyzeJavaScriptFile(content, analysis);
    
    case '.py':
      return analyzePythonFile(content, analysis);
    
    case '.java':
      return analyzeJavaFile(content, analysis);
    
    case '.vue':
      return analyzeVueFile(content, analysis);
    
    case '.html':
      return analyzeHtmlFile(content, analysis);
    
    case '.css':
    case '.scss':
      return analyzeCssFile(content, analysis);
    
    case '.json':
      return analyzeJsonFile(content, analysis);
    
    case '.md':
      return analyzeMarkdownFile(content, analysis);
    
    default:
      analysis.summary = 'فایل متنی عمومی';
      return analysis;
  }
};

/**
 * Analyze JavaScript/TypeScript files
 */
const analyzeJavaScriptFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  const lines = content.split('\n');
  
  // Find functions
  const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|async\s*\([^)]*\)\s*=>|function)|(\w+)\s*:\s*(?:\([^)]*\)\s*=>|function))/g;
  const functions: string[] = [];
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const funcName = match[1] || match[2] || match[3];
    if (funcName && !functions.includes(funcName)) {
      functions.push(funcName);
    }
  }
  
  // Find classes
  const classRegex = /class\s+(\w+)/g;
  const classes: string[] = [];
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }
  
  // Find imports
  const importRegex = /import\s+(?:{[^}]+}|\w+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  // Find exports
  const exportRegex = /export\s+(?:default\s+)?(?:function\s+(\w+)|const\s+(\w+)|class\s+(\w+))/g;
  const exports: string[] = [];
  while ((match = exportRegex.exec(content)) !== null) {
    const exportName = match[1] || match[2] || match[3];
    if (exportName) exports.push(exportName);
  }
  
  // Calculate complexity (simple heuristic)
  const complexityKeywords = ['if', 'else', 'while', 'for', 'switch', 'case', 'try', 'catch'];
  let complexity = 1;
  complexityKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'g');
    const matches = content.match(regex);
    if (matches) complexity += matches.length;
  });
  
  // Detect framework
  let framework = '';
  if (content.includes('React') || content.includes('jsx') || content.includes('useState')) {
    framework = 'React';
  } else if (content.includes('Vue') || content.includes('defineComponent')) {
    framework = 'Vue.js';
  } else if (content.includes('express') || content.includes('app.listen')) {
    framework = 'Express.js';
  }
  
  analysis.functions = functions;
  analysis.classes = classes;
  analysis.imports = imports;
  analysis.exports = exports;
  analysis.complexity = complexity;
  analysis.framework = framework;
  analysis.summary = `فایل ${analysis.language} با ${functions.length} تابع و ${classes.length} کلاس${framework ? ` (${framework})` : ''}`;
  
  return analysis;
};

/**
 * Analyze Python files
 */
const analyzePythonFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  // Find functions
  const functionRegex = /def\s+(\w+)\s*\(/g;
  const functions: string[] = [];
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }
  
  // Find classes
  const classRegex = /class\s+(\w+)/g;
  const classes: string[] = [];
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }
  
  // Find imports
  const importRegex = /(?:import\s+(\w+)|from\s+(\w+)\s+import)/g;
  const imports: string[] = [];
  while ((match = importRegex.exec(content)) !== null) {
    const importName = match[1] || match[2];
    if (importName && !imports.includes(importName)) {
      imports.push(importName);
    }
  }
  
  analysis.functions = functions;
  analysis.classes = classes;
  analysis.imports = imports;
  analysis.summary = `فایل Python با ${functions.length} تابع و ${classes.length} کلاس`;
  
  return analysis;
};

/**
 * Analyze Java files
 */
const analyzeJavaFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  const classRegex = /(?:public\s+)?class\s+(\w+)/g;
  const methodRegex = /(?:public|private|protected)?\s+(?:static\s+)?(?:\w+\s+)?(\w+)\s*\([^)]*\)\s*{/g;
  
  const classes: string[] = [];
  const functions: string[] = [];
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    classes.push(match[1]);
  }
  
  while ((match = methodRegex.exec(content)) !== null) {
    functions.push(match[1]);
  }
  
  analysis.classes = classes;
  analysis.functions = functions;
  analysis.summary = `فایل Java با ${classes.length} کلاس و ${functions.length} متد`;
  
  return analysis;
};

/**
 * Analyze Vue.js files
 */
const analyzeVueFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  // Check for Vue 3 Composition API or Vue 2 Options API
  const hasCompositionAPI = content.includes('defineComponent') || content.includes('setup(');
  const hasOptionsAPI = content.includes('export default {') && (content.includes('data()') || content.includes('methods:'));
  
  analysis.framework = 'Vue.js';
  analysis.summary = `کامپوننت Vue.js ${hasCompositionAPI ? '(Composition API)' : hasOptionsAPI ? '(Options API)' : ''}`;
  
  return analysis;
};

/**
 * Analyze HTML files
 */
const analyzeHtmlFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  const tagRegex = /<(\w+)/g;
  const tags = new Set<string>();
  let match;
  
  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }
  
  analysis.summary = `فایل HTML با ${tags.size} نوع تگ مختلف`;
  return analysis;
};

/**
 * Analyze CSS files
 */
const analyzeCssFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  const selectorRegex = /([.#]?[\w-]+)\s*{/g;
  const selectors: string[] = [];
  let match;
  
  while ((match = selectorRegex.exec(content)) !== null) {
    selectors.push(match[1]);
  }
  
  analysis.summary = `فایل CSS با ${selectors.length} selector`;
  return analysis;
};

/**
 * Analyze JSON files
 */
const analyzeJsonFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  try {
    const json = JSON.parse(content);
    const keys = Object.keys(json);
    
    // Detect package.json
    if (keys.includes('dependencies') && keys.includes('name')) {
      analysis.framework = 'Node.js Package';
      const deps = Object.keys(json.dependencies || {});
      analysis.dependencies = deps;
      analysis.summary = `package.json با ${deps.length} وابستگی`;
    } else {
      analysis.summary = `فایل JSON با ${keys.length} کلید اصلی`;
    }
  } catch (error) {
    analysis.summary = 'فایل JSON نامعتبر';
  }
  
  return analysis;
};

/**
 * Analyze Markdown files
 */
const analyzeMarkdownFile = (content: string, analysis: FileAnalysisResult): FileAnalysisResult => {
  const headingRegex = /^#+\s+(.+)$/gm;
  const headings: string[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push(match[1]);
  }
  
  analysis.summary = `فایل Markdown با ${headings.length} سرفصل`;
  return analysis;
};

/**
 * Get language name from file extension
 */
const getLanguageFromExtension = (extension: string): string => {
  const languageMap: { [key: string]: string } = {
    '.js': 'JavaScript',
    '.ts': 'TypeScript',
    '.jsx': 'React JSX',
    '.tsx': 'React TSX',
    '.vue': 'Vue.js',
    '.py': 'Python',
    '.java': 'Java',
    '.html': 'HTML',
    '.css': 'CSS',
    '.scss': 'SCSS',
    '.json': 'JSON',
    '.md': 'Markdown',
    '.txt': 'Text'
  };
  
  return languageMap[extension] || 'Unknown';
};

/**
 * Analyze entire project structure
 */
export const analyzeProject = async (projectPath: string): Promise<ProjectAnalysisResult> => {
  const analysis: ProjectAnalysisResult = {
    totalFiles: 0,
    totalSize: 0,
    languages: {},
    frameworks: [],
    structure: {
      directories: 0,
      files: 0,
      depth: 0
    },
    complexity: {
      average: 0,
      total: 0,
      distribution: {}
    },
    dependencies: {
      external: [],
      internal: [],
      devDependencies: []
    },
    summary: '',
    suggestions: []
  };
  
  try {
    await analyzeDirectoryRecursive(projectPath, analysis, 0);
    
    // Calculate averages and generate summary
    if (analysis.totalFiles > 0) {
      analysis.complexity.average = analysis.complexity.total / analysis.totalFiles;
    }
    
    // Generate summary
    const topLanguages = Object.entries(analysis.languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([lang]) => lang);
    
    analysis.summary = `پروژه شامل ${analysis.totalFiles} فایل در ${Object.keys(analysis.languages).length} زبان برنامه‌نویسی. زبان‌های اصلی: ${topLanguages.join(', ')}`;
    
    // Generate suggestions
    if (analysis.frameworks.includes('React')) {
      analysis.suggestions.push('پروژه React تشخیص داده شد - استفاده از TypeScript توصیه می‌شود');
    }
    
    if (!analysis.dependencies.external.includes('package.json') && analysis.languages['JavaScript']) {
      analysis.suggestions.push('package.json یافت نشد - ایجاد آن برای مدیریت وابستگی‌ها توصیه می‌شود');
    }
    
  } catch (error) {
    console.error('خطا در تحلیل پروژه:', error);
    analysis.summary = 'خطا در تحلیل پروژه';
  }
  
  return analysis;
};

/**
 * Recursively analyze directory
 */
const analyzeDirectoryRecursive = async (
  dirPath: string, 
  analysis: ProjectAnalysisResult, 
  currentDepth: number
): Promise<void> => {
  try {
    const items = fs.readdirSync(dirPath);
    
    analysis.structure.depth = Math.max(analysis.structure.depth, currentDepth);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        analysis.structure.directories++;
        // Skip ignored directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          await analyzeDirectoryRecursive(itemPath, analysis, currentDepth + 1);
        }
      } else {
        analysis.structure.files++;
        analysis.totalFiles++;
        analysis.totalSize += stats.size;
        
        const extension = getFileExtension(item);
        const language = getLanguageFromExtension(extension);
        
        // Count languages
        analysis.languages[language] = (analysis.languages[language] || 0) + 1;
        
        // Analyze file if it's a text file
        const fileAnalysis = await analyzeFile(itemPath);
        analysis.complexity.total += fileAnalysis.complexity || 1;
        
        // Collect frameworks
        if (fileAnalysis.framework && !analysis.frameworks.includes(fileAnalysis.framework)) {
          analysis.frameworks.push(fileAnalysis.framework);
        }
        
        // Collect dependencies
        if (fileAnalysis.dependencies) {
          analysis.dependencies.external.push(...fileAnalysis.dependencies);
        }
      }
    }
  } catch (error) {
    console.error(`خطا در تحلیل دایرکتوری ${dirPath}:`, error);
  }
};