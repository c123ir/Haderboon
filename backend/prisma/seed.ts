// Backend: backend/prisma/seed.ts
// فایل پر کردن پایگاه داده با داده‌های اولیه

import { PrismaClient, UserRole, ProjectStatus, DocumentType, DocumentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع پر کردن پایگاه داده...');

  // ایجاد کاربر ادمین
  const adminPasswordHash = await bcrypt.hash('admin123456', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@haderboon.com' },
    update: {},
    create: {
      email: 'admin@haderboon.com',
      name: 'مدیر سیستم',
      password: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ کاربر ادمین ایجاد شد:', admin.email);

  // ایجاد کاربر نمونه
  const userPasswordHash = await bcrypt.hash('user123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'user@haderboon.com' },
    update: {},
    create: {
      email: 'user@haderboon.com',
      name: 'کاربر نمونه',
      password: userPasswordHash,
      role: UserRole.USER,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  console.log('✅ کاربر نمونه ایجاد شد:', user.email);

  // ایجاد ارائه‌دهندگان AI
  const aiProviders = [
    {
      name: 'openai',
      displayName: 'OpenAI GPT',
      baseUrl: 'https://api.openai.com/v1',
      capabilities: [
        { name: 'chat', supported: true },
        { name: 'code_analysis', supported: true },
        { name: 'document_generation', supported: true },
        { name: 'vision', supported: true }
      ],
      models: [
        {
          id: 'gpt-4',
          name: 'GPT-4',
          displayName: 'GPT-4',
          capabilities: ['chat', 'code_analysis', 'document_generation'],
          contextSize: 8192,
          costPer1kTokens: 0.03,
          isActive: true
        },
        {
          id: 'gpt-4-turbo',
          name: 'GPT-4 Turbo',
          displayName: 'GPT-4 Turbo',
          capabilities: ['chat', 'code_analysis', 'document_generation', 'vision'],
          contextSize: 128000,
          costPer1kTokens: 0.01,
          isActive: true
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo',
          displayName: 'GPT-3.5 Turbo',
          capabilities: ['chat', 'code_analysis'],
          contextSize: 4096,
          costPer1kTokens: 0.001,
          isActive: true
        }
      ]
    },
    {
      name: 'anthropic',
      displayName: 'Anthropic Claude',
      baseUrl: 'https://api.anthropic.com/v1',
      capabilities: [
        { name: 'chat', supported: true },
        { name: 'code_analysis', supported: true },
        { name: 'document_generation', supported: true },
        { name: 'tool_use', supported: true }
      ],
      models: [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          displayName: 'Claude 3 Opus',
          capabilities: ['chat', 'code_analysis', 'document_generation', 'tool_use'],
          contextSize: 200000,
          costPer1kTokens: 0.015,
          isActive: true
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          displayName: 'Claude 3 Sonnet',
          capabilities: ['chat', 'code_analysis', 'document_generation', 'tool_use'],
          contextSize: 200000,
          costPer1kTokens: 0.003,
          isActive: true
        }
      ]
    },
    {
      name: 'google',
      displayName: 'Google Gemini',
      baseUrl: 'https://generativelanguage.googleapis.com/v1',
      capabilities: [
        { name: 'chat', supported: true },
        { name: 'code_analysis', supported: true },
        { name: 'vision', supported: true }
      ],
      models: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          displayName: 'Gemini Pro',
          capabilities: ['chat', 'code_analysis'],
          contextSize: 32768,
          costPer1kTokens: 0.0005,
          isActive: true
        },
        {
          id: 'gemini-pro-vision',
          name: 'Gemini Pro Vision',
          displayName: 'Gemini Pro Vision',
          capabilities: ['chat', 'vision'],
          contextSize: 16384,
          costPer1kTokens: 0.0025,
          isActive: true
        }
      ]
    }
  ];

  for (const providerData of aiProviders) {
    const provider = await prisma.aIProvider.upsert({
      where: { name: providerData.name },
      update: {},
      create: {
        name: providerData.name,
        displayName: providerData.displayName,
        baseUrl: providerData.baseUrl,
        capabilities: providerData.capabilities,
        models: providerData.models,
        isActive: true,
      },
    });

    console.log('✅ ارائه‌دهنده AI ایجاد شد:', provider.displayName);
  }

  // ایجاد پروژه‌های نمونه
  const project1 = await prisma.project.create({
    data: {
      name: 'فروشگاه آنلاین',
      description: 'پلتفرم فروشگاه آنلاین با React و Node.js',
      status: ProjectStatus.ACTIVE,
      progress: 85,
      userId: user.id,
      settings: {
        aiProvider: 'openai',
        autoAnalysis: true,
        notificationsEnabled: true,
        language: 'fa'
      },
      metadata: {
        totalDocuments: 0,
        totalFiles: 0,
        technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
        framework: 'Express.js'
      }
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'اپلیکیشن موبایل',
      description: 'اپلیکیشن کراس پلتفرم با React Native',
      status: ProjectStatus.DEVELOPMENT,
      progress: 60,
      userId: user.id,
      settings: {
        aiProvider: 'anthropic',
        autoAnalysis: true,
        notificationsEnabled: true,
        language: 'fa'
      },
      metadata: {
        totalDocuments: 0,
        totalFiles: 0,
        technologies: ['React Native', 'Expo', 'Firebase'],
        framework: 'React Native'
      }
    }
  });

  console.log('✅ پروژه‌های نمونه ایجاد شدند');

  // ایجاد تگ‌های نمونه
  const tags = await Promise.all([
    prisma.tag.create({
      data: {
        name: 'API',
        color: '#3B82F6',
        userId: user.id
      }
    }),
    prisma.tag.create({
      data: {
        name: 'Frontend',
        color: '#10B981',
        userId: user.id
      }
    }),
    prisma.tag.create({
      data: {
        name: 'Backend',
        color: '#F59E0B',
        userId: user.id
      }
    }),
    prisma.tag.create({
      data: {
        name: 'Database',
        color: '#EF4444',
        userId: user.id
      }
    }),
    prisma.tag.create({
      data: {
        name: 'Security',
        color: '#8B5CF6',
        userId: user.id
      }
    })
  ]);

  console.log('✅ تگ‌های نمونه ایجاد شدند');

  // ایجاد مستندات نمونه
  const doc1 = await prisma.document.create({
    data: {
      title: 'مستندات API فروشگاه',
      content: `# مستندات API فروشگاه آنلاین

## مقدمه
این مستند شامل تمام endpoint های API فروشگاه آنلاین است.

## Authentication
برای دسترسی به API ها باید از JWT token استفاده کنید.

## Endpoints

### کاربران
- \`GET /api/users\` - دریافت لیست کاربران
- \`POST /api/users\` - ایجاد کاربر جدید
- \`GET /api/users/:id\` - دریافت اطلاعات کاربر

### محصولات
- \`GET /api/products\` - دریافت لیست محصولات
- \`POST /api/products\` - اضافه کردن محصول جدید
- \`PUT /api/products/:id\` - بروزرسانی محصول

## نمونه درخواست

\`\`\`javascript
const response = await fetch('/api/products', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});
\`\`\`

## پاسخ های خطا
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`404\` - Not Found
- \`500\` - Internal Server Error`,
      type: DocumentType.API_DOCUMENTATION,
      status: DocumentStatus.PUBLISHED,
      projectId: project1.id,
      userId: user.id,
      metadata: {
        wordCount: 150,
        readingTime: 2,
        lastEditedBy: user.id,
        reviewers: [],
        publishedAt: new Date()
      }
    }
  });

  const doc2 = await prisma.document.create({
    data: {
      title: 'راهنمای نصب و راه‌اندازی',
      content: `# راهنمای نصب فروشگاه آنلاین

## پیش‌نیازها
- Node.js >= 16
- PostgreSQL >= 12
- Redis (اختیاری)

## مراحل نصب

### ۱. کلون کردن پروژه
\`\`\`bash
git clone https://github.com/shop/online-shop.git
cd online-shop
\`\`\`

### ۲. نصب وابستگی‌ها
\`\`\`bash
npm install
\`\`\`

### ۳. تنظیم متغیرهای محیطی
\`\`\`bash
cp .env.example .env
\`\`\`

### ۴. راه‌اندازی پایگاه داده
\`\`\`bash
npm run db:migrate
npm run db:seed
\`\`\`

### ۵. اجرای برنامه
\`\`\`bash
npm run dev
\`\`\`

## پیکربندی

### تنظیمات پایگاه داده
در فایل \`.env\` رشته اتصال پایگاه داده را تنظیم کنید:

\`\`\`
DATABASE_URL="postgresql://username:password@localhost:5432/shop"
\`\`\`

### تنظیمات امنیتی
کلید JWT را در \`.env\` تغییر دهید:

\`\`\`
JWT_SECRET="your-secret-key"
\`\`\`

## عیب‌یابی

اگر با مشکل مواجه شدید، ابتدا لاگ‌ها را بررسی کنید:

\`\`\`bash
npm run logs
\`\`\``,
      type: DocumentType.USER_GUIDE,
      status: DocumentStatus.PUBLISHED,
      projectId: project1.id,
      userId: user.id,
      metadata: {
        wordCount: 200,
        readingTime: 3,
        lastEditedBy: user.id,
        reviewers: [],
        publishedAt: new Date()
      }
    }
  });

  const doc3 = await prisma.document.create({
    data: {
      title: 'معماری سیستم',
      content: `# معماری سیستم فروشگاه آنلاین

## نمای کلی

سیستم فروشگاه آنلاین از معماری میکروسرویس استفاده می‌کند.

## کامپوننت‌های اصلی

### ۱. API Gateway
- مسئول routing درخواست‌ها
- اعمال rate limiting
- احراز هویت اولیه

### ۲. سرویس کاربران
- مدیریت حساب‌های کاربری
- احراز هویت و مجوزها
- پروفایل کاربران

### ۳. سرویس محصولات
- مدیریت کاتالوگ محصولات
- جستجو و فیلتر
- مدیریت موجودی

### ۴. سرویس سفارشات
- پردازش سفارشات
- مدیریت سبد خرید
- تاریخچه خریدها

## پایگاه داده

### کاربران
\`\`\`sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### محصولات
\`\`\`sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  price DECIMAL(10,2),
  inventory INT DEFAULT 0
);
\`\`\`

## فلوچارت پردازش سفارش

1. کاربر محصولات را به سبد اضافه می‌کند
2. تایید سفارش و انتخاب روش پرداخت
3. پردازش پرداخت
4. کاهش موجودی
5. ارسال ایمیل تایید

## مسائل امنیتی

- تمام API ها محافظت JWT دارند
- رمزهای عبور با bcrypt هش می‌شوند
- داده‌های حساس رمزگذاری می‌شوند
- تمام ورودی‌ها validate می‌شوند`,
      type: DocumentType.ARCHITECTURE,
      status: DocumentStatus.DRAFT,
      projectId: project1.id,
      userId: user.id,
      metadata: {
        wordCount: 300,
        readingTime: 4,
        lastEditedBy: user.id,
        reviewers: []
      }
    }
  });

  console.log('✅ مستندات نمونه ایجاد شدند');

  // اتصال تگ‌ها به مستندات
  await prisma.documentTag.createMany({
    data: [
      { documentId: doc1.id, tagId: tags[0].id }, // API
      { documentId: doc1.id, tagId: tags[2].id }, // Backend
      { documentId: doc2.id, tagId: tags[1].id }, // Frontend
      { documentId: doc2.id, tagId: tags[2].id }, // Backend
      { documentId: doc3.id, tagId: tags[2].id }, // Backend
      { documentId: doc3.id, tagId: tags[3].id }, // Database
      { documentId: doc3.id, tagId: tags[4].id }, // Security
    ]
  });

  console.log('✅ تگ‌ها به مستندات متصل شدند');

  // ایجاد نسخه‌های مستند
  await prisma.documentVersion.createMany({
    data: [
      {
        documentId: doc1.id,
        versionNumber: 1,
        title: 'مستندات API فروشگاه - نسخه اولیه',
        content: doc1.content,
        changelog: 'نسخه اولیه مستندات API',
        isPublished: true,
        createdBy: user.id
      },
      {
        documentId: doc2.id,
        versionNumber: 1,
        title: 'راهنمای نصب - نسخه اولیه',
        content: doc2.content,
        changelog: 'راهنمای اولیه نصب و راه‌اندازی',
        isPublished: true,
        createdBy: user.id
      }
    ]
  });

  console.log('✅ نسخه‌های مستند ایجاد شدند');

  // ایجاد مکالمه نمونه
  const conversation = await prisma.conversation.create({
    data: {
      title: 'مشاوره طراحی API',
      userId: user.id,
      projectId: project1.id,
      metadata: {
        messageCount: 2,
        tokensUsed: 150,
        aiProvider: 'openai',
        modelUsed: 'gpt-4',
        lastActivityAt: new Date()
      }
    }
  });

  // ایجاد پیام‌های نمونه
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        content: 'سلام، می‌خواهم برای API فروشگاه آنلاین‌ام مشاوره بگیرم. بهترین ساختار چیست؟',
        role: 'USER',
        userId: user.id,
        metadata: {
          tokens: 25,
          processingTime: 0,
          model: 'user-input'
        }
      },
      {
        conversationId: conversation.id,
        content: 'سلام! برای طراحی API فروشگاه آنلاین، پیشنهاد می‌کنم از معماری RESTful استفاده کنید. ساختار زیر را پیشنهاد می‌دهم:\n\n1. **Authentication endpoints**: /auth/login, /auth/register\n2. **User management**: /users, /users/:id\n3. **Product catalog**: /products, /categories\n4. **Shopping cart**: /cart, /cart/items\n5. **Orders**: /orders, /orders/:id\n\nآیا می‌خواهید در مورد هر بخش بیشتر صحبت کنیم؟',
        role: 'ASSISTANT',
        metadata: {
          tokens: 125,
          processingTime: 1200,
          confidence: 0.95,
          model: 'gpt-4',
          temperature: 0.7
        }
      }
    ]
  });

  console.log('✅ مکالمه و پیام‌های نمونه ایجاد شدند');

  // ایجاد تنظیمات سیستم
  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'app_name',
        value: 'ایجنت هادربون'
      },
      {
        key: 'app_version',
        value: '1.0.0'
      },
      {
        key: 'max_file_size',
        value: 10485760 // 10MB
      },
      {
        key: 'allowed_file_types',
        value: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
      },
      {
        key: 'default_ai_provider',
        value: 'openai'
      },
      {
        key: 'maintenance_mode',
        value: false
      }
    ]
  });

  console.log('✅ تنظیمات سیستم ایجاد شدند');

  console.log('\n🎉 پر کردن پایگاه داده با موفقیت تکمیل شد!');
  console.log('\n📋 خلاصه داده‌های ایجاد شده:');
  console.log('👥 کاربران: 2 (admin@haderboon.com, user@haderboon.com)');
  console.log('🤖 ارائه‌دهندگان AI: 3 (OpenAI, Anthropic, Google)');
  console.log('📁 پروژه‌ها: 2 (فروشگاه آنلاین، اپلیکیشن موبایل)');
  console.log('📝 مستندات: 3 (API، راهنمای نصب، معماری)');
  console.log('🏷️ تگ‌ها: 5 (API، Frontend، Backend، Database، Security)');
  console.log('💬 مکالمات: 1 با 2 پیام');
  console.log('\n🔑 اطلاعات ورود:');
  console.log('Admin: admin@haderboon.com / admin123456');
  console.log('User: user@haderboon.com / user123456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ خطا در پر کردن پایگاه داده:', e);
    await prisma.$disconnect();
    process.exit(1);
  });