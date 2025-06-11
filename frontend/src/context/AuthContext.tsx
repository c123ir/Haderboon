// frontend/src/context/AuthContext.tsx
// این فایل شامل کانتکست احراز هویت برای مدیریت وضعیت ورود و ثبت‌نام کاربر است

import React, { createContext, useReducer, useEffect, useContext } from 'react';
import { AuthContextType, AuthState, LoginUserInput, RegisterUserInput, AuthActionTypes } from '../utils/types'; // تغییر مسیر
import * as authService from '../services/api';

// وضعیت اولیه احراز هویت
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
};

// تایپ عملیات‌های احراز هویت
type AuthAction =
  | { type: AuthActionTypes.LOGIN_SUCCESS | AuthActionTypes.REGISTER_SUCCESS; payload: { user: any; token: string } }
  | { type: AuthActionTypes.USER_LOADED; payload: any }
  | { type: AuthActionTypes.AUTH_ERROR; payload: string }
  | { type: AuthActionTypes.LOGOUT }
  | { type: AuthActionTypes.CLEAR_ERROR }
  | { type: AuthActionTypes.SET_LOADING; payload: boolean };

// کاهنده (reducer) برای مدیریت وضعیت احراز هویت
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_SUCCESS:
    case AuthActionTypes.REGISTER_SUCCESS:
      console.log('ورود/ثبت‌نام موفق:', action.payload);
      authService.setAuthToken(action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case AuthActionTypes.USER_LOADED:
      console.log('کاربر بارگذاری شد:', action.payload);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case AuthActionTypes.AUTH_ERROR:
      console.error('خطای احراز هویت:', action.payload);
      authService.setAuthToken(null);
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case AuthActionTypes.LOGOUT:
      console.log('کاربر از سیستم خارج شد');
      authService.setAuthToken(null);
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AuthActionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// ایجاد کانتکست احراز هویت
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  clearError: () => {},
});

// هوک برای استفاده از کانتکست احراز هویت
export const useAuth = () => useContext(AuthContext);

// پروایدر کانتکست احراز هویت
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // بررسی توکن و بارگذاری اطلاعات کاربر در هنگام بارگذاری اپلیکیشن
  useEffect(() => {
    const loadUser = async () => {
      // تنظیم وضعیت بارگذاری
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      
      // بارگذاری توکن از localStorage
      const token = authService.loadToken();
      
      if (!token) {
        console.log('توکن یافت نشد، احراز هویت غیرفعال شد');
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
        return;
      }

      try {
        console.log('در حال بارگذاری اطلاعات کاربر با توکن موجود...');
        // دریافت اطلاعات کاربر از سرور
        const data = await authService.getCurrentUser();
        console.log('پاسخ از سرور در getCurrentUser:', data);
        
        if (data && data.data && data.data.user) {
          dispatch({ type: AuthActionTypes.USER_LOADED, payload: data.data.user });
          console.log('کاربر با موفقیت بارگذاری شد');
        } else {
          console.error('خطا در ساختار پاسخ API:', data);
          throw new Error('خطا در دریافت اطلاعات کاربر');
        }
      } catch (error) {
        console.error('خطا در احراز هویت:', error);
        dispatch({ 
          type: AuthActionTypes.AUTH_ERROR, 
          payload: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.' 
        });
      }
    };

    loadUser();
  }, []);

  // تابع ورود کاربر
  const login = async (userData: LoginUserInput) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      console.log('در حال ارسال درخواست ورود...');
      
      const data = await authService.login(userData);
      console.log('پاسخ درخواست ورود:', data);
      
      if (data && data.data) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: { user: data.data.user, token: data.data.token },
        });
        console.log('ورود موفقیت‌آمیز');
      } else {
        console.error('خطا در ساختار پاسخ API ورود:', data);
        throw new Error('داده‌های ورود معتبر نیستند');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'خطا در ورود به سیستم';
      console.error('خطا در ورود:', message);
      dispatch({ type: AuthActionTypes.AUTH_ERROR, payload: message });
    }
  };

  // تابع ثبت‌نام کاربر
  const register = async (userData: RegisterUserInput) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      console.log('در حال ارسال درخواست ثبت‌نام...');
      
      const data = await authService.register(userData);
      console.log('پاسخ درخواست ثبت‌نام:', data);
      
      if (data && data.data) {
        dispatch({
          type: AuthActionTypes.REGISTER_SUCCESS,
          payload: { user: data.data.user, token: data.data.token },
        });
        console.log('ثبت‌نام موفقیت‌آمیز');
      } else {
        console.error('خطا در ساختار پاسخ API ثبت‌نام:', data);
        throw new Error('داده‌های ثبت‌نام معتبر نیستند');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'خطا در ثبت‌نام';
      console.error('خطا در ثبت‌نام:', message);
      dispatch({ type: AuthActionTypes.AUTH_ERROR, payload: message });
    }
  };

  // تابع خروج کاربر
  const logout = () => {
    dispatch({ type: AuthActionTypes.LOGOUT });
  };

  // تابع پاک کردن پیام‌های خطا
  const clearError = () => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};