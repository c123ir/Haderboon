// frontend/src/pages/Home.tsx
// این فایل شامل صفحه اصلی برنامه است

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// صفحه اصلی
const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="px-4 py-6 bg-white shadow">
        <div className="container flex items-center justify-between mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 font-vazirmatn">ایجنت هادربون</h1>
          <div>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                داشبورد
              </Link>
            ) : (
              <div className="space-x-2 space-x-reverse rtl">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ورود
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  ثبت‌نام
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 py-12 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 font-vazirmatn sm:text-4xl">
            به ایجنت هادربون خوش آمدید
          </h2>
          <p className="mt-4 text-lg text-gray-600 font-vazirmatn">
            ایجنت هادربون یک پلتفرم هوشمند مستندسازی و مدیریت دانش است که با استفاده از هوش مصنوعی به شما کمک می‌کند اطلاعات و دانش سازمانی خود را بهتر مدیریت کنید.
          </p>

          <div className="mt-8">
            {isAuthenticated ? (
              <div className="p-4 bg-green-50 rounded-md">
                <p className="text-green-700 font-vazirmatn">
                  سلام {user?.username}! شما وارد شده‌اید.{' '}
                  <Link to="/dashboard" className="font-medium underline">
                    مشاهده داشبورد
                  </Link>
                </p>
              </div>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                شروع کنید - ثبت‌نام رایگان
              </Link>
            )}
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 font-vazirmatn">مستندسازی هوشمند</h3>
              <p className="mt-2 text-gray-600 font-vazirmatn">
                اسناد و دانش خود را با کمک هوش مصنوعی به شکلی ساختاریافته و قابل جستجو مستندسازی کنید.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 font-vazirmatn">جستجوی پیشرفته</h3>
              <p className="mt-2 text-gray-600 font-vazirmatn">
                با استفاده از موتور جستجوی پیشرفته، به سرعت به اطلاعات مورد نیاز خود دسترسی پیدا کنید.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 font-vazirmatn">همکاری تیمی</h3>
              <p className="mt-2 text-gray-600 font-vazirmatn">
                با همکاران خود روی مستندات همکاری کنید و دانش سازمانی را به اشتراک بگذارید.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 