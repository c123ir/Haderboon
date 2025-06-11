// frontend/src/pages/Register.tsx
// این فایل شامل صفحه ثبت‌نام است

import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

// صفحه ثبت‌نام
const Register: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <RegisterForm />
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 font-vazirmatn">
            قبلاً ثبت‌نام کرده‌اید؟{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              ورود به حساب کاربری
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 