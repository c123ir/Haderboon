// backend/src/utils/types.ts
// این فایل برای تعریف تایپ‌های TypeScript مورد استفاده در برنامه است

// تایپ برای کاربر احراز هویت شده در درخواست‌ها
export interface AuthenticatedRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    username: string;
  };
}

// تایپ برای اطلاعات ثبت‌نام کاربر
export interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
}

// تایپ برای اطلاعات ورود کاربر
export interface LoginUserInput {
  email: string;
  password: string;
}

// تایپ برای پاسخ احراز هویت
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
  };
  token: string;
}
