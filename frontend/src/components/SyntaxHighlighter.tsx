// components/SyntaxHighlighter.tsx
import React from 'react';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

// Simple syntax highlighter without external dependencies
const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({
  code,
  language,
  showLineNumbers = true,
  className = ''
}) => {
  const lines = code.split('\n');

  const getTokenStyle = (token: string, type: string): string => {
    switch (type) {
      case 'keyword':
        return 'text-purple-400 font-semibold';
      case 'string':
        return 'text-green-400';
      case 'number':
        return 'text-orange-400';
      case 'comment':
        return 'text-gray-500 italic';
      case 'function':
        return 'text-blue-400';
      case 'variable':
        return 'text-cyan-400';
      case 'operator':
        return 'text-pink-400';
      case 'boolean':
        return 'text-red-400';
      case 'property':
        return 'text-yellow-400';
      default:
        return 'text-white';
    }
  };

  const highlightTypescript = (line: string): React.ReactNode => {
    // Keywords
    const keywords = /\b(abstract|any|as|asserts|bigint|boolean|break|case|catch|class|const|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|never|new|null|number|object|package|private|protected|public|readonly|require|return|set|static|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|unique|unknown|var|void|while|with|yield)\b/g;
    
    // Strings
    const strings = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
    
    // Numbers
    const numbers = /\b\d+(\.\d+)?\b/g;
    
    // Comments
    const singleLineComments = /\/\/.*$/g;
    const multiLineComments = /\/\*[\s\S]*?\*\//g;
    
    // Functions
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;
    
    // Properties
    const properties = /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    
    // Operators
    const operators = /[+\-*/%=<>!&|^~?:]/g;

    let result = line;
    
    // Apply highlighting in order of precedence
    result = result.replace(multiLineComments, (match) => 
      `<span class="${getTokenStyle(match, 'comment')}">${match}</span>`
    );
    
    result = result.replace(singleLineComments, (match) => 
      `<span class="${getTokenStyle(match, 'comment')}">${match}</span>`
    );
    
    result = result.replace(strings, (match) => 
      `<span class="${getTokenStyle(match, 'string')}">${match}</span>`
    );
    
    result = result.replace(keywords, (match) => 
      `<span class="${getTokenStyle(match, 'keyword')}">${match}</span>`
    );
    
    result = result.replace(numbers, (match) => 
      `<span class="${getTokenStyle(match, 'number')}">${match}</span>`
    );
    
    result = result.replace(functions, (match, func) => 
      `<span class="${getTokenStyle(func, 'function')}">${func}</span>(`
    );
    
    result = result.replace(properties, (match, prop) => 
      `.<span class="${getTokenStyle(prop, 'property')}">${prop}</span>`
    );

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const highlightJavascript = (line: string): React.ReactNode => {
    // Similar to TypeScript but without type annotations
    const keywords = /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|export|extends|false|finally|for|from|function|if|import|in|instanceof|let|new|null|return|super|switch|this|throw|true|try|typeof|undefined|var|void|while|with|yield|async|await)\b/g;
    
    const strings = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
    const numbers = /\b\d+(\.\d+)?\b/g;
    const comments = /\/\/.*$|\/\*[\s\S]*?\*\//g;
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g;

    let result = line;
    
    result = result.replace(comments, (match) => 
      `<span class="${getTokenStyle(match, 'comment')}">${match}</span>`
    );
    result = result.replace(strings, (match) => 
      `<span class="${getTokenStyle(match, 'string')}">${match}</span>`
    );
    result = result.replace(keywords, (match) => 
      `<span class="${getTokenStyle(match, 'keyword')}">${match}</span>`
    );
    result = result.replace(numbers, (match) => 
      `<span class="${getTokenStyle(match, 'number')}">${match}</span>`
    );
    result = result.replace(functions, (match, func) => 
      `<span class="${getTokenStyle(func, 'function')}">${func}</span>(`
    );

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const highlightJson = (line: string): React.ReactNode => {
    const keys = /(".*?")\s*:/g;
    const strings = /:\s*(".*?")/g;
    const numbers = /:\s*(\d+(?:\.\d+)?)/g;
    const booleans = /:\s*(true|false|null)/g;

    let result = line;
    
    result = result.replace(keys, (match, key) => 
      `<span class="${getTokenStyle(key, 'property')}">${key}</span>:`
    );
    result = result.replace(strings, (match, str) => 
      `: <span class="${getTokenStyle(str, 'string')}">${str}</span>`
    );
    result = result.replace(numbers, (match, num) => 
      `: <span class="${getTokenStyle(num, 'number')}">${num}</span>`
    );
    result = result.replace(booleans, (match, bool) => 
      `: <span class="${getTokenStyle(bool, 'boolean')}">${bool}</span>`
    );

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const highlightCss = (line: string): React.ReactNode => {
    const selectors = /^[^{]*(?={)/g;
    const properties = /([a-zA-Z-]+)\s*:/g;
    const values = /:\s*([^;]+);/g;
    const comments = /\/\*[\s\S]*?\*\//g;

    let result = line;
    
    result = result.replace(comments, (match) => 
      `<span class="${getTokenStyle(match, 'comment')}">${match}</span>`
    );
    result = result.replace(selectors, (match) => 
      `<span class="${getTokenStyle(match, 'function')}">${match}</span>`
    );
    result = result.replace(properties, (match, prop) => 
      `<span class="${getTokenStyle(prop, 'property')}">${prop}</span>:`
    );
    result = result.replace(values, (match, value) => 
      `: <span class="${getTokenStyle(value, 'string')}">${value}</span>;`
    );

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const highlightHtml = (line: string): React.ReactNode => {
    const tags = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    const attributes = /(\w+)="([^"]*)"/g;
    const comments = /<!--[\s\S]*?-->/g;

    let result = line;
    
    result = result.replace(comments, (match) => 
      `<span class="${getTokenStyle(match, 'comment')}">${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
    );
    result = result.replace(tags, (match) => 
      `<span class="${getTokenStyle(match, 'keyword')}">${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
    );

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  const highlightLine = (line: string, lineNumber: number): React.ReactNode => {
    if (!line.trim()) {
      return <div key={lineNumber} className="leading-6 font-mono text-sm">&nbsp;</div>;
    }

    let content: React.ReactNode;
    
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'tsx':
        content = highlightTypescript(line);
        break;
      case 'javascript':
      case 'jsx':
        content = highlightJavascript(line);
        break;
      case 'json':
        content = highlightJson(line);
        break;
      case 'css':
      case 'scss':
      case 'sass':
        content = highlightCss(line);
        break;
      case 'html':
        content = highlightHtml(line);
        break;
      default:
        content = <span className="text-white">{line}</span>;
    }

    return (
      <div key={lineNumber} className="leading-6 font-mono text-sm">
        {content}
      </div>
    );
  };

  return (
    <div className={`flex text-sm ${className}`} dir="ltr">
      {showLineNumbers && (
        <div className="bg-gray-800/30 border-l border-white/10 min-w-[3rem] p-2 select-none">
          {lines.map((_, index) => (
            <div
              key={index}
              className="text-white/40 text-xs font-mono leading-6 text-right px-2"
            >
              {index + 1}
            </div>
          ))}
        </div>
      )}
      
      <div className="flex-1 p-2 overflow-auto">
        {lines.map((line, index) => highlightLine(line, index))}
      </div>
    </div>
  );
};

export default SyntaxHighlighter;