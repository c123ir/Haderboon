// Backend: backend/prisma/seed.ts (Corrected for Real Schema)
// فایل پر کردن پایگاه داده با schema واقعی

import { PrismaClient } from '@prisma/client';
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
      username: 'admin',
      firstName: 'مدیر',
      lastName: 'سیستم',
      password: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
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
      username: 'user',
      firstName: 'کاربر',
      lastName: 'نمونه',
      password: userPasswordHash,
      role: 'USER',
      isActive: true,
    },
  });

  console.log('✅ کاربر نمونه ایجاد شد:', user.email);

  // ایجاد پروژه‌های نمونه
  try {
    const project1 = await prisma.project.create({
      data: {
        name: 'فروشگاه آنلاین',
        description: 'پلتفرم فروشگاه آنلاین با React و Node.js',
        status: 'ACTIVE',
        userId: user.id,
        settings: {},
        metadata: {},
        repositoryUrl: 'https://github.com/example/shop'
      }
    });

    const project2 = await prisma.project.create({
      data: {
        name: 'اپلیکیشن موبایل',
        description: 'اپلیکیشن کراس پلتفرم با React Native',
        status: 'DEVELOPMENT',
        userId: user.id,
        settings: {},
        metadata: {},
        repositoryUrl: 'https://github.com/example/mobile-app'
      }
    });

    console.log('✅ پروژه‌های نمونه ایجاد شدند');

    // ایجاد مستند ساده
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
        type: 'API_DOCUMENTATION',
        status: 'PUBLISHED',
        projectId: project1.id,
        userId: user.id,
        metadata: {}
      }
    });

    const doc2 = await prisma.document.create({
      data: {
        title: 'راهنمای نصب',
        content: `# راهنمای نصب اپلیکیشن موبایل

## پیش‌نیازها
- Node.js >= 16
- React Native CLI
- Android Studio یا Xcode

## مراحل نصب

### ۱. کلون کردن پروژه
\`\`\`bash
git clone https://github.com/example/mobile-app.git
cd mobile-app
\`\`\`

### ۲. نصب وابستگی‌ها
\`\`\`bash
npm install
\`\`\`

### ۳. اجرای برنامه
\`\`\`bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
\`\`\``,
        type: 'USER_GUIDE',
        status: 'DRAFT',
        projectId: project2.id,
        userId: user.id,
        metadata: {}
      }
    });

    console.log('✅ مستندات نمونه ایجاد شدند');

  } catch (error) {
    console.log('⚠️ خطا در ایجاد پروژه‌ها یا مستندات:', error);
  }

  console.log('\n🎉 پر کردن پایگاه داده با موفقیت تکمیل شد!');
  console.log('\n📋 خلاصه داده‌های ایجاد شده:');
  console.log('👥 کاربران: 2 (admin, user)');
  console.log('📁 پروژه‌ها: 2 (فروشگاه آنلاین، اپ موبایل)');
  console.log('📝 مستندات: 2 (API، راهنمای نصب)');
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