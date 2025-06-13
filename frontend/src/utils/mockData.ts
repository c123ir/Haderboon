// frontend/src/utils/mockData.ts

import { Project, ProjectFile, ChatSession, ChatMessage, Documentation, GeneratedPrompt, FileTreeNode } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'فروشگاه آنلاین ماهان',
    description: 'پروژه فروشگاه آنلاین با React و Node.js',
    path: '/projects/mahan-shop',
    userId: 'user1',
    filesCount: 47,
    lastAnalyzed: '2024-06-13T10:30:00Z',
    status: 'ready',
    createdAt: '2024-06-10T09:00:00Z',
    updatedAt: '2024-06-13T10:30:00Z',
  },
  {
    id: '2',
    name: 'اپلیکیشن مدیریت وظایف',
    description: 'برنامه مدیریت وظایف تیمی با Vue.js',
    path: '/projects/task-manager',
    userId: 'user1',
    filesCount: 23,
    lastAnalyzed: '2024-06-12T14:20:00Z',
    status: 'analyzing',
    createdAt: '2024-06-08T11:15:00Z',
    updatedAt: '2024-06-12T14:20:00Z',
  },
  {
    id: '3',
    name: 'سیستم مدیریت کتابخانه',
    description: 'سیستم مدیریت کتابخانه دیجیتال',
    path: '/projects/library-system',
    userId: 'user1',
    filesCount: 67,
    status: 'ready',
    createdAt: '2024-06-05T08:45:00Z',
    updatedAt: '2024-06-11T16:10:00Z',
  },
];

export const mockFileTree: FileTreeNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'directory',
    path: '/src',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'directory',
        path: '/src/components',
        children: [
          {
            id: '3',
            name: 'Header.tsx',
            type: 'file',
            path: '/src/components/Header.tsx',
            size: 2048,
            lastModified: '2024-06-13T09:30:00Z',
          },
          {
            id: '4',
            name: 'ProductList.tsx',
            type: 'file',
            path: '/src/components/ProductList.tsx',
            size: 3567,
            lastModified: '2024-06-13T10:15:00Z',
          },
        ],
      },
      {
        id: '5',
        name: 'pages',
        type: 'directory',
        path: '/src/pages',
        children: [
          {
            id: '6',
            name: 'HomePage.tsx',
            type: 'file',
            path: '/src/pages/HomePage.tsx',
            size: 1890,
            lastModified: '2024-06-12T16:45:00Z',
          },
          {
            id: '7',
            name: 'ProductPage.tsx',
            type: 'file',
            path: '/src/pages/ProductPage.tsx',
            size: 4123,
            lastModified: '2024-06-13T08:20:00Z',
          },
        ],
      },
      {
        id: '8',
        name: 'utils',
        type: 'directory',
        path: '/src/utils',
        children: [
          {
            id: '9',
            name: 'api.ts',
            type: 'file',
            path: '/src/utils/api.ts',
            size: 2756,
            lastModified: '2024-06-11T14:30:00Z',
          },
        ],
      },
    ],
  },
  {
    id: '10',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    size: 1456,
    lastModified: '2024-06-10T09:00:00Z',
  },
  {
    id: '11',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    size: 987,
    lastModified: '2024-06-10T09:05:00Z',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    sessionId: 'session1',
    role: 'user',
    content: 'سلام، می‌خوام درباره ساختار این پروژه بیشتر بدونم',
    createdAt: '2024-06-13T09:00:00Z',
  },
  {
    id: '2',
    sessionId: 'session1',
    role: 'assistant',
    content: 'سلام! این پروژه یک فروشگاه آنلاین است که با React توسعه داده شده. ساختار اصلی شامل کامپوننت‌ها، صفحات و ابزارهای کمکی است. آیا سوال خاصی درباره بخش خاصی دارید؟',
    createdAt: '2024-06-13T09:01:00Z',
  },
  {
    id: '3',
    sessionId: 'session1',
    role: 'user',
    content: 'کامپوننت ProductList چطور کار می‌کنه؟',
    createdAt: '2024-06-13T09:05:00Z',
  },
  {
    id: '4',
    sessionId: 'session1',
    role: 'assistant',
    content: 'کامپوننت ProductList مسئول نمایش لیست محصولات است. این کامپوننت از API دریافت اطلاعات محصولات می‌کند و آنها را در قالب کارت‌هایی نمایش می‌دهد. همچنین قابلیت فیلتر کردن و جستجو در محصولات را دارد.',
    createdAt: '2024-06-13T09:06:00Z',
  },
];

export const mockChatSessions: ChatSession[] = [
  {
    id: 'session1',
    projectId: '1',
    title: 'بررسی ساختار پروژه',
    messages: mockChatMessages,
    createdAt: '2024-06-13T09:00:00Z',
    updatedAt: '2024-06-13T09:06:00Z',
  },
  {
    id: 'session2',
    projectId: '1',
    title: 'بهبود عملکرد کامپوننت‌ها',
    messages: [],
    createdAt: '2024-06-12T14:30:00Z',
    updatedAt: '2024-06-12T14:30:00Z',
  },
];

export const mockDocumentation: Documentation[] = [
  {
    id: '1',
    projectId: '1',
    title: 'مستندات کلی پروژه',
    content: `# فروشگاه آنلاین ماهان

## توضیحات کلی
این پروژه یک فروشگاه آنلاین کامل است که امکانات زیر را ارائه می‌دهد:
- نمایش محصولات
- سبد خرید
- پرداخت آنلاین
- مدیریت کاربران

## ساختار پروژه
- \`src/components\`: کامپوننت‌های قابل استفاده مجدد
- \`src/pages\`: صفحات اصلی اپلیکیشن
- \`src/utils\`: ابزارهای کمکی و توابع مشترک

## تکنولوژی‌ها
- React 18.2
- TypeScript
- Tailwind CSS
- Axios`,
    type: 'auto',
    status: 'final',
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2024-06-13T09:30:00Z',
  },
  {
    id: '2',
    projectId: '1',
    title: 'راهنمای API',
    content: `# راهنمای استفاده از API

## نقاط انتهایی (Endpoints)

### محصولات
- \`GET /api/products\`: دریافت لیست محصولات
- \`GET /api/products/:id\`: دریافت جزئیات محصول
- \`POST /api/products\`: ایجاد محصول جدید

### کاربران
- \`POST /api/auth/login\`: ورود کاربر
- \`POST /api/auth/register\`: ثبت نام کاربر`,
    type: 'manual',
    status: 'draft',
    createdAt: '2024-06-11T11:00:00Z',
    updatedAt: '2024-06-11T11:00:00Z',
  },
];

export const mockGeneratedPrompts: GeneratedPrompt[] = [
  {
    id: '1',
    projectId: '1',
    title: 'بهبود کامپوننت ProductList',
    description: 'پرامپت برای بهبود عملکرد و اضافه کردن قابلیت‌های جدید',
    prompt: `## Context
شما در حال کار روی یک فروشگاه آنلاین React هستید. کامپوننت ProductList فعلی ساده است و نیاز به بهبود دارد.

## کد فعلی ProductList:
\`\`\`tsx
// کد فعلی کامپوننت که نیاز به بهبود دارد
\`\`\`

## درخواست:
لطفاً کامپوننت ProductList را بهبود دهید تا:
1. قابلیت فیلتر کردن بر اساس دسته‌بندی داشته باشد
2. جستجوی سریع در نام محصولات امکان‌پذیر باشد
3. Pagination اضافه شود
4. Loading state مناسب داشته باشد

## محدودیت‌ها:
- از TypeScript استفاده کنید
- از Tailwind CSS برای استایل استفاده کنید
- کد باید قابل استفاده مجدد باشد
- Performance را در نظر بگیرید`,
    context: {
      files: ['src/components/ProductList.tsx'],
      projectStructure: 'React + TypeScript',
    },
    createdAt: '2024-06-13T10:45:00Z',
  },
];

export const mockProjectFiles: ProjectFile[] = [
  {
    id: '1',
    projectId: '1',
    path: '/src/components/Header.tsx',
    name: 'Header.tsx',
    type: 'typescript',
    size: 2048,
    content: `import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <h1>فروشگاه ماهان</h1>
    </header>
  );
};

export default Header;`,
    analysis: {
      functions: ['Header'],
      classes: [],
      imports: ['React'],
      exports: ['Header'],
      complexity: 1,
      lines: 12,
      summary: 'کامپوننت ساده برای نمایش هدر سایت',
    },
    createdAt: '2024-06-10T09:00:00Z',
    updatedAt: '2024-06-13T09:30:00Z',
  },
];

// Helper functions for mock data
export const getProjectById = (id: string): Project | undefined => {
  return mockProjects.find(project => project.id === id);
};

export const getProjectFiles = (projectId: string): ProjectFile[] => {
  return mockProjectFiles.filter(file => file.projectId === projectId);
};

export const getChatSessions = (projectId: string): ChatSession[] => {
  return mockChatSessions.filter(session => session.projectId === projectId);
};

export const getDocumentation = (projectId: string): Documentation[] => {
  return mockDocumentation.filter(doc => doc.projectId === projectId);
};

export const getGeneratedPrompts = (projectId: string): GeneratedPrompt[] => {
  return mockGeneratedPrompts.filter(prompt => prompt.projectId === projectId);
};