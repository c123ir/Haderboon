// frontend/src/pages/Login.tsx
// این فایل شامل صفحه ورود است

import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

// صفحه ورود
const Login: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <LoginForm />
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 font-vazirmatn">
            هنوز ثبت‌نام نکرده‌اید؟{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              ایجاد حساب کاربری
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 