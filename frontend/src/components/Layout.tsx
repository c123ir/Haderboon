import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusIcon, 
  Cog6ToothIcon, 
  DocumentTextIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navigation = [
    { name: 'داشبورد', href: '/', icon: HomeIcon },
    { name: 'پروژه جدید', href: '/new-project', icon: PlusIcon },
    { name: 'مستندات', href: '/docs', icon: DocumentTextIcon },
    { name: 'تنظیمات', href: '/settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    if (window.confirm('آیا می‌خواهید از سیستم خارج شوید؟')) {
      apiService.clearStorageAndReload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-white">
                  هادربون
                </Link>
              </div>
              
              {/* Navigation links */}
              <div className="hidden sm:mr-6 sm:flex sm:space-x-reverse sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        inline-flex items-center px-1 pt-1 text-sm font-medium
                        ${isActive
                          ? 'text-blue-400 border-b-2 border-blue-400'
                          : 'text-white/60 hover:text-white hover:border-b-2 hover:border-white/50'
                        }
                        transition-colors duration-200
                      `}
                    >
                      <item.icon className="w-4 h-4 ml-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
                title="خروج از سیستم"
              >
                <PowerIcon className="w-4 h-4 ml-2" />
                خروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 