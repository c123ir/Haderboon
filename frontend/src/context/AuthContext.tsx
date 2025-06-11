// frontend/src/context/AuthContext.tsx
// این فایل شامل کانتکست احراز هویت برای مدیریت وضعیت ورود و ثبت‌نام کاربر است

import React, { createContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, LoginUserInput, RegisterUserInput } from '../types'; // تغییر مسیر
import * as authService from '../services/api';

// وضعیت اولیه احراز هویت
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

// انواع عملیات‌های احراز هویت
enum AuthActionTypes {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  AUTH_ERROR = 'AUTH_ERROR',
  USER_LOADED = 'USER_LOADED',
  LOGOUT = 'LOGOUT',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_LOADING = 'SET_LOADING',
}

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
      authService.setAuthToken(action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        loading: false,
        error: null,
      };
    case AuthActionTypes.USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };
    case AuthActionTypes.AUTH_ERROR:
      authService.setAuthToken(null);
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: action.payload,
      };
    case AuthActionTypes.LOGOUT:
      authService.setAuthToken(null);
      return {
        ...state,
        isAuthenticated: false,
        user: null,
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

// پروایدر کانتکست احراز هویت
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // بررسی توکن و بارگذاری اطلاعات کاربر در هنگام بارگذاری اپلیکیشن
  useEffect(() => {
    const loadUser = async () => {
      const token = authService.loadToken();
      
      if (!token) {
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
        return;
      }

      try {
        const { user } = await authService.getCurrentUser();
        dispatch({ type: AuthActionTypes.USER_LOADED, payload: user });
      } catch (error) {
        dispatch({ type: AuthActionTypes.AUTH_ERROR, payload: 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.' });
      }
    };

    loadUser();
  }, []);

  // تابع ورود کاربر
  const login = async (userData: LoginUserInput) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      const data = await authService.login(userData);
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'خطا در ورود به سیستم';
      dispatch({ type: AuthActionTypes.AUTH_ERROR, payload: message });
    }
  };

  // تابع ثبت‌نام کاربر
  const register = async (userData: RegisterUserInput) => {
    try {
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
      const data = await authService.register(userData);
      dispatch({
        type: AuthActionTypes.REGISTER_SUCCESS,
        payload: { user: data.user, token: data.token },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'خطا در ثبت‌نام';
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