// frontend/src/pages/Settings.tsx
// صفحه تنظیمات برنامه

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AIProviderSettings {
  openai?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  google?: {
    apiKey: string;
    model: string;
  };
}

/**
 * صفحه تنظیمات برنامه
 * این صفحه امکان تنظیم کلیدهای API مدل‌های مختلف هوش مصنوعی را فراهم می‌کند
 */
const Settings: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<AIProviderSettings>({
    openai: { apiKey: '', model: 'gpt-4' },
    anthropic: { apiKey: '', model: 'claude-3-sonnet-20240229' },
    google: { apiKey: '', model: 'gemini-pro' }
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

  const handleInputChange = (provider: keyof AIProviderSettings, field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
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
      openai: { apiKey: '', model: 'gpt-4' },
      anthropic: { apiKey: '', model: 'claude-3-sonnet-20240229' },
      google: { apiKey: '', model: 'gemini-pro' }
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
            {/* تنظیمات OpenAI */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-vazirmatn">OpenAI (ChatGPT)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                    کلید API
                  </label>
                  <input
                    type="password"
                    value={settings.openai?.apiKey || ''}
                    onChange={(e) => handleInputChange('openai', 'apiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                    مدل
                  </label>
                  <select
                    value={settings.openai?.model || 'gpt-4'}
                    onChange={(e) => handleInputChange('openai', 'model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </select>
                </div>
              </div>
            </div>

            {/* تنظیمات Anthropic */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-vazirmatn">Anthropic (Claude)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                    کلید API
                  </label>
                  <input
                    type="password"
                    value={settings.anthropic?.apiKey || ''}
                    onChange={(e) => handleInputChange('anthropic', 'apiKey', e.target.value)}
                    placeholder="sk-ant-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                    مدل
                  </label>
                  <select
                    value={settings.anthropic?.model || 'claude-3-sonnet-20240229'}
                    onChange={(e) => handleInputChange('anthropic', 'model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </select>
                </div>
              </div>
            </div>

            {/* تنظیمات Google */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 font-vazirmatn">Google (Gemini)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                    کلید API
                  </label>
                  <input
                    type="password"
                    value={settings.google?.apiKey || ''}
                    onChange={(e) => handleInputChange('google', 'apiKey', e.target.value)}
                    placeholder="AIza..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 font-vazirmatn mb-2">
                    مدل
                  </label>
                  <select
                    value={settings.google?.model || 'gemini-pro'}
                    onChange={(e) => handleInputChange('google', 'model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex justify-between items-center">
              <div>
                {saveMessage && (
                  <span className={`text-sm font-vazirmatn ${
                    saveMessage.includes('موفقیت') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {saveMessage}
                  </span>
                )}
              </div>
              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-vazirmatn"
                >
                  بازنشانی
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 font-vazirmatn"
                >
                  {isSaving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* راهنمای دریافت کلید API */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 font-vazirmatn mb-4">راهنمای دریافت کلید API</h3>
          <div className="space-y-3 text-sm text-blue-700 font-vazirmatn">
            <div>
              <strong>OpenAI:</strong> از 
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                platform.openai.com/api-keys
              </a>
              {' '}کلید API خود را دریافت کنید.
            </div>
            <div>
              <strong>Anthropic:</strong> از 
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                console.anthropic.com
              </a>
              {' '}کلید API خود را دریافت کنید.
            </div>
            <div>
              <strong>Google:</strong> از 
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">
                makersuite.google.com/app/apikey
              </a>
              {' '}کلید API خود را دریافت کنید.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;