// frontend/src/pages/Settings.tsx
// صفحه تنظیمات برنامه

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AIProviderSettings } from '../utils/types';

/**
 * صفحه تنظیمات برنامه
 * این صفحه امکان تنظیم کلیدهای API مدل‌های مختلف هوش مصنوعی را فراهم می‌کند
 */
const Settings: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<AIProviderSettings>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // هدایت به صفحه ورود اگر کاربر احراز هویت نشده است
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // بارگذاری تنظیمات از localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiProviderSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('خطا در بارگذاری تنظیمات:', error);
      }
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // ذخیره در localStorage
      localStorage.setItem('aiProviderSettings', JSON.stringify(settings));
      
      setSaveMessage('تنظیمات با موفقیت ذخیره شد!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات:', error);
      setSaveMessage('خطا در ذخیره تنظیمات!');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4'
    });
    localStorage.removeItem('aiProviderSettings');
    setSaveMessage('تنظیمات بازنشانی شد!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // نمایش اسپینر در حالت بارگذاری
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* هدر */}
      <div className="px-4 py-6 bg-white shadow">
        <div className="container flex items-center justify-between mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 font-vazirmatn">تنظیمات</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-vazirmatn"
          >
            بازگشت به داشبورد
          </button>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 font-vazirmatn">تنظیمات مدل‌های هوش مصنوعی</h2>
            <p className="mt-2 text-gray-600 font-vazirmatn">
              کلیدهای API مدل‌های مختلف هوش مصنوعی را وارد کنید تا بتوانید از آن‌ها در چت هوشمند استفاده کنید.
            </p>
          </div>

          <div className="p-6 space-y-8">
            {/* انتخاب مدل */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 font-vazirmatn mb-4">انتخاب مدل هوش مصنوعی</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                  ارائه‌دهنده
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="openai">OpenAI (ChatGPT)</option>
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="azure">Azure OpenAI</option>
                </select>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                  کلید API
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="کلید API را وارد کنید..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                  مدل
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {settings.provider === 'openai' && (
                    <>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </>
                  )}
                  {settings.provider === 'anthropic' && (
                    <>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                      <option value="claude-3-haiku">Claude 3 Haiku</option>
                    </>
                  )}
                  {settings.provider === 'azure' && (
                    <>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* دکمه‌های عملیات */}
            <div className="flex justify-end space-x-2 space-x-reverse">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                بازنشانی
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none ${
                  isSaving ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
              </button>
            </div>
            
            {/* پیام موفقیت */}
            {saveMessage && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-center">
                {saveMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;