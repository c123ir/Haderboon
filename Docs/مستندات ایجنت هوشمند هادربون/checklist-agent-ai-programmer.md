# چک لیست توسعه: ایجنت دستیار مستندساز هوشمند

این چک لیست، مراحل و وظایف مورد نیاز برای توسعه ایجنت دستیار مستندساز هوشمند را به تفکیک ارائه می‌دهد.

## ۰. آماده‌سازی و راه‌اندازی پروژه جدید

*   [x] **تصمیم‌گیری در مورد ساختار مونو‌ریپو یا چند‌ریپو:** (پیشنهاد: مونو‌ریپو برای سهولت توسعه بک‌اند و فرانت‌اند در کنار هم)
*   [x] **ایجاد دایرکتوری‌های اصلی:** `backend/`, `frontend/`, `database/` (یا `prisma/`)
*   [x] **راه‌اندازی پروژه Node.js در `backend/`:**
    *   [x] `npm init -y`
    *   [x] نصب TypeScript و ابزارهای مرتبط (`npm install typescript ts-node nodemon @types/node --save-dev`)
    *   [x] پیکربندی `tsconfig.json`
*   [x] **راه‌اندازی پروژه React در `frontend/`:**
    *   [x] `npx create-react-app . --template typescript` (یا Vite)
    *   [x] نصب Tailwind CSS (`npm install -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`)
    *   [x] پیکربندی `tailwind.config.js` و `index.css`
*   [x] **راه‌اندازی Prisma و PostgreSQL:**
    *   [x] نصب Prisma CLI (`npm install prisma --save-dev`)
    *   [x] راه‌اندازی Prisma در `backend/` (`npx prisma init`)
    *   [x] پیکربندی `.env` برای اتصال به PostgreSQL (DB_URL)
    *   [x] ایجاد مدل‌های اولیه در `backend/prisma/schema.prisma` (مانند `User`, `Project`, `Document`, `ChatConversation`, `ChatMessage`)
    *   [x] اجرای Migration اولیه (`npx prisma migrate dev --name init`)

## ۱. توسعه بک‌اند (Backend)

### ۱.۱. تنظیمات اولیه و ابزارها
*   [ ] نصب Express.js (`npm install express @types/express`)
*   [ ] نصب Dotenv (`npm install dotenv`)
*   [ ] پیکربندی سرور Express.js در `backend/src/app.ts` (یا `index.ts`)
*   [ ] تنظیم CORS (`npm install cors @types/cors`)
*   [ ] نصب `bcryptjs` (برای هش کردن پسورد) و `jsonwebtoken` (برای JWT)
*   [ ] ایجاد پوشه `utils` برای `prismaClient.ts`
*   [ ] ایجاد `middleware` برای Auth (احراز هویت) و Error Handling

### ۱.۲. ماژول احراز هویت (Authentication)
*   [ ] **مدل `User` در Prisma:** (شامل `id`, `username`, `email`, `passwordHash`, `createdAt`, `updatedAt`)
*   [ ] **کنترلر `authController.ts`:**
    *   [ ] تابع `registerUser` (هش کردن پسورد، ذخیره در دیتابیس، تولید JWT)
    *   [ ] تابع `loginUser` (اعتبار سنجی پسورد، تولید JWT)
*   [ ] **مسیرهای `auth.ts`:**
    *   [ ] `POST /api/v1/auth/register`
    *   [ ] `POST /api/v1/auth/login`
*   [ ] **Middleware احراز هویت (`authMiddleware.ts`):**
    *   [ ] اعتبار سنجی JWT، استخراج `userId` و قرار دادن در `req.user`
*   [ ] **رمزهای عبور و JWT:**
    *   [ ] `JWT_SECRET` در `env.`
    *   [ ] `JWT_EXPIRES_IN` در `env.`

### ۱.۳. ماژول مدیریت پروژه (Project Management)
*   [ ] **مدل `Project` در Prisma:** (شامل `id`, `name`, `description`, `ownerId (FK to User)`, `createdAt`, `updatedAt`)
*   [ ] **کنترلر `projectController.ts`:**
    *   [ ] `createProject`
    *   [ ] `getProjectsByUser` (فقط پروژه‌های کاربر لاگین شده)
    *   [ ] `getProjectById`
    *   [ ] `updateProject`
    *   [ ] `deleteProject`
*   [ ] **مسیرهای `projects.ts`:** (همراه با `protect` middleware)
    *   [ ] `POST /api/v1/projects`
    *   [ ] `GET /api/v1/projects`
    *   [ ] `GET /api/v1/projects/:id`
    *   [ ] `PUT /api/v1/projects/:id`
    *   [ ] `DELETE /api/v1/projects/:id`

### ۱.۴. ماژول مدیریت مستندات (Documentation Management)
*   [ ] **مدل `Document` در Prisma:** (شامل `id`, `projectId (FK to Project)`, `title`, `content` (JSONB برای محتوای ساختاریافته), `type` (Enum: `CODE_ANALYSIS`, `DESIGN_DECISION`, `FLOWCHART`, `REQUIREMENT` و غیره), `version`, `createdAt`, `updatedAt`)
*   [ ] **کنترلر `documentController.ts`:**
    *   [ ] `createDocument`
    *   [ ] `getDocumentsByProject`
    *   [ ] `getDocumentById`
    *   [ ] `updateDocument`
    *   [ ] `deleteDocument`
    *   [ ] `searchDocuments` (جستجو در محتوا)
*   [ ] **مسیرهای `documents.ts`:** (همراه با `protect` middleware)
    *   [ ] `POST /api/v1/projects/:projectId/documents`
    *   [ ] `GET /api/v1/projects/:projectId/documents`
    *   [ ] `GET /api/v1/documents/:id`
    *   [ ] `PUT /api/v1/documents/:id`
    *   [ ] `DELETE /api/v1/documents/:id`

### ۱.۵. ماژول چت هوشمند (AI Chat & Interaction)
*   [ ] **مدل `Conversation` در Prisma:** (شامل `id`, `projectId (FK to Project)`, `userId (FK to User)`, `title`, `createdAt`, `updatedAt`)
*   [ ] **مدل `Message` در Prisma:** (شامل `id`, `conversationId (FK to Conversation)`, `sender (Enum: USER, AI)`, `contentType (Enum: TEXT, IMAGE)`, `content` (JSONB برای متن یا URL تصویر), `createdAt`)
*   [ ] **کنترلر `conversationsController.ts`:**
    *   [ ] `createConversation`
    *   [ ] `getConversationsByUserAndProject`
    *   [ ] `getConversationById`
*   [ ] **کنترلر `messagesController.ts`:**
    *   [ ] `sendMessage` (ذخیره پیام کاربر، فراخوانی AI، ذخیره پاسخ AI)
    *   [ ] `getMessagesByConversationId`
*   [ ] **مسیرهای `conversations.ts` و `messages.ts`:** (همراه با `protect` middleware)
    *   [ ] `POST /api/v1/conversations` (برای شروع مکالمه جدید)
    *   [ ] `GET /api/v1/projects/:projectId/conversations`
    *   [ ] `GET /api/v1/conversations/:conversationId/messages`
    *   [ ] `POST /api/v1/conversations/:conversationId/messages` (برای ارسال پیام)

### ۱.۶. ماژول آپلود فایل (File Upload)
*   [ ] **مدل `File` در Prisma:** (شامل `id`, `name`, `path`, `mimeType`, `size`, `uploadedBy (FK to User)`, `projectId (FK to Project)`, `createdAt`)
*   [ ] **نصب `multer` و تنظیم `diskStorage`:**
*   [ ] **کنترلر `filesController.ts`:**
    *   [ ] `uploadFile` (دریافت فایل، ذخیره در سیستم فایل، ثبت اطلاعات در دیتابیس)
*   [ ] **مسیر `files.ts`:**
    *   [ ] `POST /api/v1/files/upload` (همراه با `multer` middleware و `protect`)

### ۱.۷. ادغام با API‌های هوش مصنوعی (AI Integration)
*   [ ] **پیکربندی کلیدهای API:** در `.env` (مثلاً `GEMINI_API_KEY`, `OPENROUTER_API_KEY`)
*   [ ] **سرویس `aiService.ts`:** (یک ماژول مجزا برای منطق ارتباط با AI)
    *   [ ] توابع برای فراخوانی Gemini Pro (متنی)
    *   [ ] توابع برای فراخوانی Gemini Pro Vision (تصویری)
    *   [ ] توابع برای فراخوانی OpenRouter (قابلیت سوئیچ بین مدل‌ها)
    *   [ ] مدیریت تاریخچه چت برای ارسال به AI (ضروری برای "به خاطر سپردن" مکالمات)
    *   [ ] **تبدیل مکالمات داخلی به فرمت پرامپت مناسب برای AI.**

## ۲. توسعه فرانت‌اند (Frontend)

### ۲.۱. تنظیمات اولیه و ابزارها
*   [ ] نصب React Router DOM (`npm install react-router-dom`)
*   [ ] نصب Axios (`npm install axios`)
*   [ ] پیکربندی `tailwind.config.js`
*   [ ] ایجاد یک Context API یا Zustand/Jotai برای مدیریت وضعیت سراسری (احراز هویت، کاربر فعلی، پروژه فعلی)

### ۲.۲. ماژول احراز هویت (Authentication UI)
*   [ ] **صفحه `Login.tsx`:** فرم ورود، ارسال درخواست به بک‌اند، ذخیره JWT در Local Storage/Context.
*   [ ] **صفحه `Register.tsx`:** فرم ثبت نام، ارسال درخواست به بک‌اند.
*   [ ] **`ProtectedRoute` کامپوننت:** برای محافظت از مسیرهای خصوصی.

### ۲.۳. ماژول مدیریت پروژه UI
*   [ ] **صفحه `Dashboard.tsx`:** نمایش لیست پروژه‌های کاربر.
*   [ ] **کامپوننت `CreateProjectModal`:** برای ایجاد پروژه جدید.
*   [ ] **کامپوننت `ProjectCard`:** نمایش اطلاعات خلاصه پروژه.
*   [ ] **صفحه `ProjectDetails.tsx`:** نمایش جزئیات پروژه (و لینک به مستندات و چت).

### ۲.۴. ماژول مستندسازی UI
*   [ ] **صفحه `DocumentList.tsx`:** نمایش لیست مستندات یک پروژه خاص.
*   [ ] **کامپوننت `DocumentViewer`:** برای نمایش محتوای مستندات (با پشتیبانی از فرمت‌های مختلف).
*   [ ] **کامپوننت `DocumentEditor`:** برای ویرایش و افزودن مستندات جدید (احتمالاً با Rich Text Editor).
*   [ ] **فرم جستجو و فیلتر مستندات.**

### ۲.۵. ماژول چت هوشمند UI
*   [ ] **صفحه `ChatPage.tsx`:** (صفحه اصلی چت)
    *   [ ] مدیریت وضعیت برای `currentConversation`, `messages`, `isLoading`, `error`.
    *   [ ] رندر `ConversationList`, `MessageDisplay`, `MessageInput`.
*   [ ] **کامپوننت `ConversationList.tsx`:**
    *   [ ] نمایش لیست مکالمات کاربر برای پروژه فعلی.
    *   [ ] قابلیت شروع مکالمه جدید.
    *   [ ] قابلیت انتخاب مکالمه برای ادامه.
*   [ ] **کامپوننت `MessageDisplay.tsx`:**
    *   [ ] نمایش پیام‌های چت (متن و تصاویر).
    *   [ ] قابلیت نمایش پیام‌های کاربر و AI به صورت مجزا.
*   [ ] **کامپوننت `MessageInput.tsx`:**
    *   [ ] فیلد ورودی متن.
    *   [ ] دکمه آپلود فایل (برای تصاویر).
    *   [ ] دکمه ارسال پیام.
    *   [ ] نمایش وضعیت "در حال تایپ" AI.
*   [ ] **سرویس `chatService.ts`:**
    *   [ ] توابع برای فراخوانی APIهای بک‌اند (`getConversations`, `getMessages`, `sendMessage`, `uploadFile`).
    *   [ ] مدیریت خطاهای API.

### ۲.۶. ماژول آپلود فایل UI
*   [ ] **کامپوننت `FileUploadButton`:** (استفاده در `MessageInput` و سایر فرم‌ها)
*   [ ] نمایش پیش‌نمایش تصویر قبل از آپلود.
*   [ ] نمایش وضعیت آپلود.

### ۲.۷. سرویس‌های API
*   [ ] **`apiClient.ts`:** (پیکربندی Axios با Base URL و Interceptor برای JWT)
*   [ ] **فایل‌های سرویس جداگانه:** (مثلاً `authService.ts`, `projectService.ts`, `documentService.ts`, `chatService.ts`, `fileService.ts`)

## ۳. قابلیت‌های پیشرفته و آتی (Beyond MVP)

*   [ ] **تحلیل تصاویر و اسکرین‌شات:**
    *   [ ] ادغام با Gemini Pro Vision در بک‌اند.
    *   [ ] UI برای آپلود و نمایش تحلیل تصاویر.
*   [ ] **چت گفتاری:**
    *   [ ] استفاده از API‌های تبدیل گفتار به متن (STT) و متن به گفتار (TTS).
    *   [ ] رابط کاربری برای ورودی و خروجی صوتی.
*   [ ] **مدیریت انواع فایل:**
    *   [ ] گسترش مدل `File` و کنترلر `filesController` برای انواع فایل‌ها.
    *   [ ] UI برای مدیریت و نمایش انواع فایل‌ها.
*   [ ] **تفکیک کامل پروژه‌ها:**
    *   [ ] اطمینان از ایزوله بودن داده‌ها و مستندات هر پروژه.
*   [ ] **ورود فایل چت/مستند:**
    *   [ ] قابلیت آپلود فایل‌های متنی یا JSON برای تحلیل و افزودن به مستندات.
*   [ ] **یکپارچه‌سازی با Git/VCS:**
    *   [ ] وب‌هوک‌ها (Webhooks) برای رصد تغییرات کد.
    *   [ ] قابلیت همگام‌سازی مستندات با نسخه‌های کد.
*   [ ] **سیستم بازخورد و یادگیری:**
    *   [ ] مکانیزم بازخورد کاربر برای بهبود عملکرد ایجنت.
    *   [ ] ذخیره بازخوردها برای آموزش‌های آتی.
*   [ ] **داشبورد و گزارش‌دهی:**
    *   [ ] خلاصه‌های آماری از مستندات، پیشرفت پروژه، و فعالیت‌ها.
    *   [ ] نمایش گرافیکی داده‌ها.

---

امیدوارم این دو سند، یک دید جامع و یک نقشه راه واضح برای توسعه پروژه ایجنت دستیار مستندساز هوشمند شما فراهم کند. لطفاً هر زمان که سوال یا نیاز به شفاف‌سازی بیشتری داشتید، به من اطلاع دهید.