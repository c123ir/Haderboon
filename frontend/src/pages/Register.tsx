// frontend/src/pages/Register.tsx
// این فایل شامل صفحه ثبت‌نام است

import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

/**
 * صفحه ثبت‌نام در سیستم
 * این صفحه فرم ثبت‌نام را نمایش می‌دهد
 */
const Register: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 font-vazirmatn">
            ثبت‌نام در ایجنت هادربون
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-vazirmatn">
            یا{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              وارد شوید
            </Link>
          </p>
        </div>
        
        <RegisterForm />
        
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 font-vazirmatn">
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register; 