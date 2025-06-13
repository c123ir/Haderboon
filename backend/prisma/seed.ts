// Backend: backend/prisma/seed.ts (Fixed)
// فایل پر کردن پایگاه داده با داده‌های اولیه - نسخه تصحیح شده

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 شروع پر کردن پایگاه داده...');

  // بررسی schema فعلی
  const userModel = await prisma.$queryRaw`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users'
  `;
  console.log('📋 ستون‌های جدول users:', userModel);

  // ایجاد کاربر ادمین
  const adminPasswordHash = await bcrypt.hash('admin123456', 12);
  
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@haderboon.com' },
      update: {},
      create: {
        email: 'admin@haderboon.com',
        name: 'مدیر سیستم',
        username: 'admin', // اضافه کردن username
        password: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ کاربر ادمین ایجاد شد:', admin.email);
  } catch (error) {
    console.log('❌ خطا در ایجاد ادمین:', error);
    console.log('🔄 تلاش مجدد بدون فیلدهای اضافی...');
    
    // تلاش با حداقل فیلدها
    const admin = await prisma.user.upsert({
      where: { email: 'admin@haderboon.com' },
      update: {},
      create: {
        email: 'admin@haderboon.com',
        username: 'admin',
        password: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });
    console.log('✅ کاربر ادمین ایجاد شد (نسخه ساده):', admin.email);
  }

  // ایجاد کاربر نمونه
  const userPasswordHash = await bcrypt.hash('user123456', 12);
  
  try {
    const user = await prisma.user.upsert({
      where: { email: 'user@haderboon.com' },
      update: {},
      create: {
        email: 'user@haderboon.com',
        name: 'کاربر نمونه',
        username: 'user', // اضافه کردن username
        password: userPasswordHash,
        role: 'USER',
        isActive: true,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    console.log('✅ کاربر نمونه ایجاد شد:', user.email);
  } catch (error) {
    console.log('❌ خطا در ایجاد کاربر:', error);
    
    // تلاش با حداقل فیلدها
    const user = await prisma.user.upsert({
      where: { email: 'user@haderboon.com' },
      update: {},
      create: {
        email: 'user@haderboon.com',
        username: 'user',
        password: userPasswordHash,
        role: 'USER',
        isActive: true,
      },
    });
    console.log('✅ کاربر نمونه ایجاد شد (نسخه ساده):', user.email);
  }

  // دریافت کاربران برای استفاده در بقیه seed
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@haderboon.com' }
  });
  
  const normalUser = await prisma.user.findUnique({
    where: { email: 'user@haderboon.com' }
  });

  if (!adminUser || !normalUser) {
    throw new Error('خطا در ایجاد کاربران اولیه');
  }

  // ایجاد پروژه‌های نمونه (ساده)
  try {
    const project1 = await prisma.project.create({
      data: {
        name: 'فروشگاه آنلاین',
        description: 'پلتفرم فروشگاه آنلاین با React و Node.js',
        status: 'ACTIVE',
        progress: 85,
        userId: normalUser.id,
        settings: {},
        metadata: {}
      }
    });

    const project2 = await prisma.project.create({
      data: {
        name: 'اپلیکیشن موبایل',
        description: 'اپلیکیشن کراس پلتفرم با React Native',
        status: 'DEVELOPMENT',
        progress: 60,
        userId: normalUser.id,
        settings: {},
        metadata: {}
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
- \`PUT /api/products/:id\` - بروزرسانی محصول`,
        type: 'API_DOCUMENTATION',
        status: 'PUBLISHED',
        projectId: project1.id,
        userId: normalUser.id,
        metadata: {}
      }
    });

    console.log('✅ مستند نمونه ایجاد شد');

  } catch (error) {
    console.log('⚠️ خطا در ایجاد پروژه‌ها یا مستندات:', error);
  }

  console.log('\n🎉 پر کردن پایگاه داده با موفقیت تکمیل شد!');
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