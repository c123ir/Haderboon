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
  priority?: number;        // اولویت استفاده در حالت خودکار
}

// تایپ به‌روزرسانی مدل
export interface AIModelUpdateInput {
  displayName?: string;
  description?: string;
  isActive?: boolean;
  capabilities?: string[];
  contextSize?: number;
  settings?: Record<string, any>;
  priority?: number;
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

/**
 * تنظیمات درخواست چت
 */
export interface AIChatSettings {
  /**
   * دمای مدل (0.0 تا 1.0)
   * مقادیر کمتر: پاسخ‌های متمرکزتر و قابل پیش‌بینی‌تر
   * مقادیر بیشتر: پاسخ‌های متنوع‌تر و خلاقانه‌تر
   */
  temperature?: number;
  
  /**
   * حداکثر تعداد توکن‌های پاسخ
   */
  maxTokens?: number;
  
  /**
   * احتمال نمونه‌برداری هسته (nucleus sampling)
   * مدل فقط از توکن‌هایی استفاده می‌کند که احتمال تجمعی آن‌ها کمتر از مقدار تعیین شده است
   */
  topP?: number;
  
  /**
   * جریمه برای تکرار توکن‌ها
   * مقادیر مثبت: کاهش احتمال تکرار کلمات و عبارات
   */
  frequencyPenalty?: number;
  
  /**
   * جریمه برای استفاده از توکن‌های جدید
   * مقادیر مثبت: افزایش احتمال صحبت درباره موضوعات جدید
   */
  presencePenalty?: number;
  
  /**
   * انتخاب تصادفی از میان K توکن احتمالی بالا
   */
  topK?: number;
}

/**
 * اطلاعات استفاده از توکن‌ها
 */
export interface AITokenUsage {
  /**
   * تعداد توکن‌های پرامپت
   */
  promptTokens: number;
  
  /**
   * تعداد توکن‌های پاسخ
   */
  completionTokens: number;
  
  /**
   * تعداد کل توکن‌ها
   */
  totalTokens: number;
}

/**
 * اطلاعات یک سرویس‌دهنده AI
 */
export interface AIProviderInfo {
  /**
   * شناسه منحصر به فرد
   */
  id: string;
  
  /**
   * نام سرویس‌دهنده
   */
  name: string;
  
  /**
   * آدرس وب‌سایت
   */
  website?: string;
  
  /**
   * توضیحات
   */
  description?: string;
  
  /**
   * نیاز به کلید API
   */
  requiresApiKey: boolean;
}

/**
 * اطلاعات یک مدل AI
 */
export interface AIModelInfo {
  /**
   * شناسه منحصر به فرد
   */
  id: string;
  
  /**
   * نام نمایشی
   */
  name: string;
  
  /**
   * نام سرویس‌دهنده
   */
  provider: string;
  
  /**
   * قابلیت‌ها
   */
  capabilities: string[];
  
  /**
   * اندازه حافظه متن (تعداد توکن‌ها)
   */
  contextSize?: number;
  
  /**
   * توضیحات
   */
  description?: string;
  
  /**
   * هزینه تقریبی به ازای 1000 توکن (به دلار)
   */
  costPer1KTokens?: {
    input?: number;
    output?: number;
  };
}

/**
 * نوع محتوای پیام
 */
export enum AIMessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file'
}

/**
 * نقش پیام
 */
export enum AIMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool'
}

/**
 * محتوای پیام
 */
export interface AIMessageContent {
  /**
   * نوع محتوا
   */
  type: AIMessageContentType;
  
  /**
   * متن یا URL محتوا
   */
  data: string;
  
  /**
   * نام فایل (برای محتوای فایل)
   */
  filename?: string;
  
  /**
   * اطلاعات اضافی (اختیاری)
   */
  meta?: Record<string, any>;
}

/**
 * پیام جلسه AI
 */
export interface AIMessage {
  /**
   * شناسه منحصر به فرد
   */
  id: string;
  
  /**
   * شناسه جلسه
   */
  sessionId: string;
  
  /**
   * نقش پیام
   */
  role: AIMessageRole;
  
  /**
   * محتوای پیام
   */
  content: AIMessageContent[] | string;
  
  /**
   * زمان ایجاد
   */
  createdAt: Date;
  
  /**
   * اطلاعات استفاده از توکن‌ها (برای پیام‌های دستیار)
   */
  usage?: AITokenUsage;
}

/**
 * جلسه AI
 */
export interface AISession {
  /**
   * شناسه منحصر به فرد
   */
  id: string;
  
  /**
   * عنوان جلسه
   */
  title: string;
  
  /**
   * شناسه کاربر
   */
  userId: string;
  
  /**
   * شناسه مدل
   */
  modelId: string;
  
  /**
   * نام سرویس‌دهنده
   */
  provider: string;
  
  /**
   * زمان ایجاد
   */
  createdAt: Date;
  
  /**
   * آخرین به‌روزرسانی
   */
  updatedAt: Date;
  
  /**
   * پیام سیستمی (دستورالعمل‌ها)
   */
  systemPrompt?: string;
  
  /**
   * تنظیمات جلسه
   */
  settings?: AIChatSettings;
  
  /**
   * تعداد پیام‌ها
   */
  messageCount: number;
}