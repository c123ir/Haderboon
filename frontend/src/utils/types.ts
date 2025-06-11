// frontend/src/utils/types.ts
// این فایل شامل تایپ‌های مورد استفاده در فرانت‌اند است

// تایپ برای اطلاعات کاربر
export interface User {
  id: string;
  email: string;
  username: string;
}

// تایپ برای اطلاعات ثبت‌نام کاربر
export interface RegisterUserInput {
  email: string;
  username: string;
  password: string;
  confirmPassword: string; // برای تأیید پسورد در فرم ثبت‌نام
}

// تایپ برای اطلاعات ورود کاربر
export interface LoginUserInput {
  email: string;
  password: string;
}

// تایپ برای پاسخ احراز هویت از API
export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
}

// تایپ برای پاسخ خطا از API
export interface ErrorResponse {
  success: boolean;
  message: string;
}

// تایپ برای وضعیت احراز هویت در کانتکست
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// تایپ برای عملیات‌های احراز هویت در کانتکست
export interface AuthContextType extends AuthState {
  login: (userData: LoginUserInput) => Promise<void>;
  register: (userData: RegisterUserInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
} 