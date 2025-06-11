// مسیر فایل: /Users/imac2019/My-Apps/Haderboon/frontend/src/types/index.ts

// تایپ‌های مربوط به پیام‌های AI
export interface AIMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// تایپ‌های مربوط به احراز هویت
export interface LoginUserInput {
  email: string;
  passwordHash: string;
}

export interface RegisterUserInput {
  username: string;
  email: string;
  passwordHash: string;
  fullName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null; // یا یک تایپ مشخص‌تر برای کاربر
  token: string | null;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (userData: LoginUserInput) => Promise<void>;
  register: (userData: RegisterUserInput) => Promise<void>;
  logout: () => void;
  // سایر موارد مورد نیاز
}

// می‌توانید سایر تایپ‌های عمومی پروژه را نیز در اینجا اضافه کنید.