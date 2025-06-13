// Frontend: frontend/src/components/common/index.tsx
// کامپوننت‌های مشترک قابل استفاده مجدد

import React, { useContext } from 'react';
import { ThemeContext } from '../../contexts';

// Action Button Component
export const ActionButton = ({ children, primary = false, onClick, disabled = false, className = '' }) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
        primary
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
          : darkMode
            ? 'bg-white bg-opacity-15 backdrop-blur-lg text-white border border-white border-opacity-20'
            : 'bg-white bg-opacity-70 text-gray-900 border border-gray-200'
      } ${className}`}
    >
      {children}
    </button>
  );
};

// Stats Card Component
export const StatsCard = ({ icon, value, label, change, color }) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`p-6 rounded-3xl backdrop-blur-lg border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
      darkMode 
        ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
        : 'bg-white bg-opacity-70 border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center text-2xl`}>
          {icon}
        </div>
        <span className="text-green-500 text-sm font-bold">{change}</span>
      </div>
      <h3 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </h3>
      <p className={darkMode ? 'text-purple-200' : 'text-gray-600'}>
        {label}
      </p>
    </div>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', color = 'purple' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}>
        <svg fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { darkMode } = useContext(ThemeContext);
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className={`inline-block w-full ${sizeClasses[size]} p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-3xl shadow-xl ${
          darkMode 
            ? 'bg-gray-900 bg-opacity-95 border border-white border-opacity-20' 
            : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-10' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Input Component
export const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  className = '' 
}) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all ${
          error 
            ? 'border-2 border-red-500' 
            : darkMode 
              ? 'bg-white bg-opacity-15 text-white placeholder-purple-200 border border-white border-opacity-20' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'
        }`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea Component
export const Textarea = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  rows = 4,
  className = '' 
}) => {
  const { darkMode } = useContext(ThemeContext);
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-purple-200' : 'text-gray-700'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition-all ${
          error 
            ? 'border-2 border-red-500' 
            : darkMode 
              ? 'bg-white bg-opacity-15 text-white placeholder-purple-200 border border-white border-opacity-20' 
              : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'
        }`}
      />
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

// Toast Notification Component
export const Toast = ({ message, type = 'info', isVisible, onClose }) => {
  const { darkMode } = useContext(ThemeContext);
  
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 ${
      darkMode ? 'bg-gray-900 text-white border border-white border-opacity-20' : 'bg-white text-gray-900 border border-gray-200'
    }`}>
      <div className="flex items-center space-x-3 space-x-reverse">
        <span className="text-lg">{icons[type]}</span>
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};