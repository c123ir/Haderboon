import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ایجاد providers پیش‌فرض
  const openaiProvider = await prisma.aIProvider.upsert({
    where: { name: 'openai' },
    update: {},
    create: {
      name: 'openai',
      displayName: 'OpenAI',
      description: 'سرویس هوش مصنوعی OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      isActive: true,
      priority: 100
    }
  });

  const anthropicProvider = await prisma.aIProvider.upsert({
    where: { name: 'anthropic' },
    update: {},
    create: {
      name: 'anthropic',
      displayName: 'Anthropic',
      description: 'سرویس هوش مصنوعی Anthropic (Claude)',
      baseUrl: 'https://api.anthropic.com',
      isActive: true,
      priority: 90
    }
  });

  const googleProvider = await prisma.aIProvider.upsert({
    where: { name: 'google' },
    update: {},
    create: {
      name: 'google',
      displayName: 'Google AI',
      description: 'سرویس هوش مصنوعی Google (Gemini)',
      baseUrl: 'https://generativelanguage.googleapis.com',
      isActive: true,
      priority: 80
    }
  });

  // ایجاد models برای OpenAI
  await prisma.aIModel.upsert({
    where: { name: 'gpt-4' },
    update: {},
    create: {
      name: 'gpt-4',
      displayName: 'GPT-4',
      description: 'مدل پیشرفته GPT-4',
      providerId: openaiProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 8192,
      isActive: true
    }
  });

  await prisma.aIModel.upsert({
    where: { name: 'gpt-4-turbo' },
    update: {},
    create: {
      name: 'gpt-4-turbo',
      displayName: 'GPT-4 Turbo',
      description: 'مدل سریع و بهینه GPT-4',
      providerId: openaiProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 128000,
      isActive: true
    }
  });

  await prisma.aIModel.upsert({
    where: { name: 'gpt-3.5-turbo' },
    update: {},
    create: {
      name: 'gpt-3.5-turbo',
      displayName: 'GPT-3.5 Turbo',
      description: 'مدل سریع و اقتصادی GPT-3.5',
      providerId: openaiProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 16385,
      isActive: true
    }
  });

  // ایجاد models برای Anthropic
  await prisma.aIModel.upsert({
    where: { name: 'claude-3-opus-20240229' },
    update: {},
    create: {
      name: 'claude-3-opus-20240229',
      displayName: 'Claude 3 Opus',
      description: 'مدل پیشرفته Claude 3 Opus',
      providerId: anthropicProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 200000,
      isActive: true
    }
  });

  await prisma.aIModel.upsert({
    where: { name: 'claude-3-sonnet-20240229' },
    update: {},
    create: {
      name: 'claude-3-sonnet-20240229',
      displayName: 'Claude 3 Sonnet',
      description: 'مدل متعادل Claude 3 Sonnet',
      providerId: anthropicProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 200000,
      isActive: true
    }
  });

  await prisma.aIModel.upsert({
    where: { name: 'claude-3-haiku-20240307' },
    update: {},
    create: {
      name: 'claude-3-haiku-20240307',
      displayName: 'Claude 3 Haiku',
      description: 'مدل سریع Claude 3 Haiku',
      providerId: anthropicProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 200000,
      isActive: true
    }
  });

  // ایجاد models برای Google
  await prisma.aIModel.upsert({
    where: { name: 'gemini-pro' },
    update: {},
    create: {
      name: 'gemini-pro',
      displayName: 'Gemini Pro',
      description: 'مدل پیشرفته Gemini Pro',
      providerId: googleProvider.id,
      capabilities: ['chat', 'text'],
      contextSize: 32768,
      isActive: true
    }
  });

  await prisma.aIModel.upsert({
    where: { name: 'gemini-pro-vision' },
    update: {},
    create: {
      name: 'gemini-pro-vision',
      displayName: 'Gemini Pro Vision',
      description: 'مدل Gemini Pro با قابلیت بینایی',
      providerId: googleProvider.id,
      capabilities: ['chat', 'text', 'vision'],
      contextSize: 32768,
      isActive: true
    }
  });

  console.log('✅ Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });