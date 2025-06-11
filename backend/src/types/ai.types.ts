// backend/src/types/ai.types.ts
// تایپ‌های مربوط به ایجنت هوشمند و هوش مصنوعی

// تایپ سرویس‌دهنده هوش مصنوعی
export interface AIProviderInput {
  name: string;             // نام سرویس (OpenAI, Google, OpenRouter, ...)
  displayName: string;      // نام نمایشی
  description?: string;     // توضیحات
  logoUrl?: string;         // آدرس لوگو
  baseUrl?: string;         // آدرس پایه API
  isActive?: boolean;       // فعال بودن سرویس
  priority?: number;        // اولویت استفاده در حالت خودکار
  settings?: Record<string, any>; // تنظیمات خاص سرویس
}

// تایپ برای به‌روزرسانی سرویس‌دهنده
export interface AIProviderUpdateInput {
  displayName?: string;
  description?: string;
  logoUrl?: string;
  baseUrl?: string;
  isActive?: boolean;
  priority?: number;
  settings?: Record<string, any>;
}

// تایپ کلید API
export interface AIApiKeyInput {
  providerId: string;      // شناسه سرویس‌دهنده
  name: string;            // نام نمایشی برای کلید
  key: string;             // کلید API (قبل از رمزنگاری)
  isActive?: boolean;      // فعال بودن کلید
  expiresAt?: Date;        // تاریخ انقضا
}

// تایپ به‌روزرسانی کلید API
export interface AIApiKeyUpdateInput {
  name?: string;
  key?: string;
  isActive?: boolean;
  expiresAt?: Date;
}

// تایپ مدل هوش مصنوعی
export interface AIModelInput {
  providerId: string;      // شناسه سرویس‌دهنده
  name: string;            // نام مدل (gpt-4, claude-2, ...)
  displayName: string;     // نام نمایشی
  description?: string;    // توضیحات
  isActive?: boolean;      // فعال بودن مدل
  capabilities?: string[]; // قابلیت‌های مدل (chat, embedding, ...)
  contextSize?: number;    // حداکثر اندازه متن ورودی
  settings?: Record<string, any>; // تنظیمات خاص مدل
}

// تایپ به‌روزرسانی مدل
export interface AIModelUpdateInput {
  displayName?: string;
  description?: string;
  isActive?: boolean;
  capabilities?: string[];
  contextSize?: number;
  settings?: Record<string, any>;
}

// تایپ ایجاد جلسه چت
export interface AISessionInput {
  title: string;           // عنوان جلسه
  providerId: string;      // شناسه سرویس‌دهنده
  modelId: string;         // شناسه مدل
  userId: string;          // شناسه کاربر
  projectId?: string;      // شناسه پروژه (اختیاری)
  documentId?: string;     // شناسه مستند (اختیاری)
  settings?: Record<string, any>; // تنظیمات خاص جلسه
}

// تایپ به‌روزرسانی جلسه
export interface AISessionUpdateInput {
  title?: string;
  settings?: Record<string, any>;
}

// تایپ پیام چت
export interface AIMessageInput {
  sessionId: string;       // شناسه جلسه
  role: 'user' | 'assistant' | 'system'; // نقش پیام
  content: string;         // محتوای پیام
}

// تایپ درخواست چت
export interface AIChatRequest {
  providerId?: string;     // شناسه سرویس‌دهنده (اختیاری - اگر خالی باشد از سرویس پیش‌فرض استفاده می‌شود)
  modelId?: string;        // شناسه مدل (اختیاری - اگر خالی باشد از مدل پیش‌فرض استفاده می‌شود)
  message: string;         // پیام کاربر
  sessionId?: string;      // شناسه جلسه (اختیاری - برای ادامه مکالمه قبلی)
  systemPrompt?: string;   // پیام سیستمی (اختیاری)
  settings?: {             // تنظیمات (اختیاری)
    temperature?: number;  // دمای تولید (0 تا 1)
    maxTokens?: number;    // حداکثر توکن‌های خروجی
    topP?: number;         // احتمال بالا (0 تا 1)
    frequencyPenalty?: number; // پنالتی تکرار
    presencePenalty?: number;  // پنالتی حضور
  };
}

// تایپ درخواست چت چندگانه
export interface AIMultiChatRequest {
  providerIds: string[];   // شناسه‌های سرویس‌دهنده‌ها
  modelIds: string[];      // شناسه‌های مدل‌ها
  message: string;         // پیام کاربر
  systemPrompt?: string;   // پیام سیستمی (اختیاری)
  summarizerProviderId?: string; // شناسه سرویس‌دهنده برای جمع‌بندی
  summarizerModelId?: string;    // شناسه مدل برای جمع‌بندی
}

// تایپ پاسخ چت
export interface AIChatResponse {
  sessionId: string;       // شناسه جلسه
  response: string;        // پاسخ هوش مصنوعی
  model: string;           // نام مدل استفاده شده
  provider: string;        // نام سرویس‌دهنده
  usage?: {                // اطلاعات مصرف
    promptTokens: number;  // تعداد توکن‌های ورودی
    completionTokens: number; // تعداد توکن‌های خروجی
    totalTokens: number;   // مجموع توکن‌ها
  };
}

// تایپ پاسخ چت چندگانه
export interface AIMultiChatResponse {
  responses: {             // پاسخ‌های هر مدل
    providerId: string;    // شناسه سرویس‌دهنده
    modelId: string;       // شناسه مدل
    response: string;      // پاسخ
    provider: string;      // نام سرویس‌دهنده
    model: string;         // نام مدل
  }[];
  summary?: string;        // جمع‌بندی پاسخ‌ها (اختیاری)
  sessionId: string;       // شناسه جلسه
} 