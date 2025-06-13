// Frontend: frontend/src/pages/Dashboard.tsx
// صفحه داشبورد اصلی

import React, { useState, useContext } from 'react';
import { ThemeContext, NavigationContext } from '../contexts';
import { StatsCard } from '../components/dashboard/StatsCard';
import { QuickActionsCard } from '../components/dashboard/QuickActionsCard';
import { RecentActivityCard } from '../components/dashboard/RecentActivityCard';
import { ActionButton } from '../components/common/ActionButton';

const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const [stats, setStats] = useState({
    projects: 15,
    documents: 243,
    chatSessions: 120,
    savedHours: 48
  });

  return (
    <div className="px-6 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            سلام به 
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> ایجنت هادربون</span>
          </h1>
          <p className={`text-xl max-w-3xl mx-auto leading-relaxed ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
            دستیار هوشمند شما برای مستندسازی پروژه‌ها، تحلیل کد و تولید محتوای تخصصی
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
            <ActionButton primary>
              🚀 شروع پروژه جدید
            </ActionButton>
            <ActionButton>
              ▶️ مشاهده دمو
            </ActionButton>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatsCard
            icon="📊"
            value={stats.projects}
            label="پروژه فعال"
            change="+12%"
            color="from-purple-500 to-indigo-500"
          />
          <StatsCard
            icon="📄"
            value={stats.documents}
            label="مستند ایجاد شده"
            change="+8%"
            color="from-pink-500 to-rose-500"
          />
          <StatsCard
            icon="💬"
            value={stats.chatSessions}
            label="جلسه چت"
            change="+25%"
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            icon="⏰"
            value={stats.savedHours}
            label="ساعت صرفه‌جویی"
            change="+15%"
            color="from-orange-500 to-red-500"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <QuickActionsCard />
          <RecentActivityCard />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;