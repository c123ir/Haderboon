// frontend/src/utils/types.ts
// تعاریف تایپ‌های مورد استفاده در برنامه

// تایپ‌های مربوط به احراز هویت
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  login: (userData: LoginUserInput) => Promise<void>;
  register: (userData: RegisterUserInput) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface RegisterUserInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// تایپ‌های مربوط به چت هوش مصنوعی
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIProviderSettings {
  provider: 'openai' | 'azure' | 'anthropic';
  apiKey: string;
  model: string;
}

// تایپ‌های مربوط به پروژه‌ها
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// تعاریف اکشن‌های احراز هویت
export enum AuthActionTypes {
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  USER_LOADED = 'USER_LOADED',
  AUTH_ERROR = 'AUTH_ERROR',
  LOGOUT = 'LOGOUT',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_LOADING = 'SET_LOADING'
}

// تایپ‌های کامپوننت‌ها
export interface ChatMessageProps {
  message: AIMessage;
} 