// Frontend: frontend/src/components/layout/Navbar.tsx
// کامپوننت نوار ناوبری اصلی

import React, { useState, useContext } from 'react';
import { ThemeContext, AuthContext, NavigationContext } from '../../contexts';

const Navbar = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const { currentPage, setCurrentPage } = useContext(NavigationContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 w-full z-50 ${darkMode ? 'bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-20' : 'bg-white bg-opacity-90 backdrop-blur-lg border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center space-x-4 space-x-reverse"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ایجنت هادربون
              </h1>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                مستندساز هوشمند
              </p>
            </div>
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <NavLink page="dashboard" icon="🏠">داشبورد</NavLink>
            <NavLink page="projects" icon="📁">پروژه‌ها</NavLink>
            <NavLink page="documents" icon="📝">مستندات</NavLink>
            <NavLink page="chat" icon="💬">چت هوشمند</NavLink>
            <NavLink page="settings" icon="⚙️">تنظیمات</NavLink>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="relative">
              <button className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold hover:scale-110 transition-transform">
                {user?.avatar || 'ک'}
              </button>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="hidden md:block">
              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {user?.name || 'کاربر'}
              </p>
              <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                آنلاین
              </p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <svg className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white border-opacity-20">
            <div className="flex flex-col space-y-2 pt-4">
              <MobileNavLink page="dashboard" icon="🏠">داشبورد</MobileNavLink>
              <MobileNavLink page="projects" icon="📁">پروژه‌ها</MobileNavLink>
              <MobileNavLink page="documents" icon="📝">مستندات</MobileNavLink>
              <MobileNavLink page="chat" icon="💬">چت هوشمند</MobileNavLink>
              <MobileNavLink page="settings" icon="⚙️">تنظیمات</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Navigation Link Component
const NavLink = ({ page, children, icon }) => {
  const { darkMode } = useContext(ThemeContext);
  const { currentPage, setCurrentPage } = useContext(NavigationContext);
  const isActive = currentPage === page;
  
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? darkMode 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-purple-100 text-purple-700'
          : darkMode 
            ? 'text-white hover:bg-white hover:bg-opacity-10' 
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </button>
  );
};

// Mobile Navigation Link Component
const MobileNavLink = ({ page, children, icon }) => {
  const { darkMode } = useContext(ThemeContext);
  const { currentPage, setCurrentPage } = useContext(NavigationContext);
  const isActive = currentPage === page;
  
  return (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? darkMode 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-purple-100 text-purple-700'
          : darkMode 
            ? 'text-white hover:bg-white hover:bg-opacity-10' 
            : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{children}</span>
    </button>
  );
};

export default Navbar;