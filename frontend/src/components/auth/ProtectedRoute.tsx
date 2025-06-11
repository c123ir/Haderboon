// frontend/src/components/auth/ProtectedRoute.tsx
// این فایل شامل کامپوننت مسیر محافظت شده برای محدود کردن دسترسی کاربران غیر مجاز است

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// کامپوننت مسیر محافظت شده
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // نمایش اسپینر در حالت بارگذاری
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
      </div>
    );
  }

  // هدایت به صفحه ورود اگر کاربر احراز هویت نشده است
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 