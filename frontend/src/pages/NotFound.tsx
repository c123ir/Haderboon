import React from 'react';
import { Link } from 'react-router-dom';

/**
 * صفحه 404 - صفحه مورد نظر یافت نشد
 * این صفحه در زمان درخواست آدرس‌های نامعتبر نمایش داده می‌شود
 */
const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-extrabold text-gray-700 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-8 font-vazirmatn">
          صفحه مورد نظر یافت نشد
        </h2>
        <p className="text-gray-600 mb-8 font-vazirmatn">
          صفحه‌ای که به دنبال آن هستید ممکن است حذف شده، نام آن تغییر کرده باشد یا موقتاً در دسترس نباشد.
        </p>
        <Link 
          to="/" 
          className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none font-vazirmatn"
        >
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 