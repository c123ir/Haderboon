// frontend/src/pages/Login.tsx
// این فایل شامل صفحه ورود است

import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

/**
 * صفحه ورود به سیستم
 * این صفحه فرم ورود را نمایش می‌دهد
 */
const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-vazirmatn">
            ورود به ایجنت هادربون
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-vazirmatn">
            یا{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 font-vazirmatn">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 