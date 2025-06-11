// frontend/src/hooks/useSettings.ts
// Hook مدیریت تنظیمات

import { useState, useEffect } from 'react';

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
 * Hook مدیریت تنظیمات
 * این hook امکان خواندن و نوشتن تنظیمات را فراهم می‌کند
 */
export const useSettings = () => {
  const [settings, setSettings] = useState<AIProviderSettings>({});
  const [isLoading, setIsLoading] = useState(true);

  // بارگذاری تنظیمات از localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('aiProviderSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('خطا در بارگذاری تنظیمات:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ذخیره تنظیمات
  const saveSettings = (newSettings: AIProviderSettings) => {
    try {
      localStorage.setItem('aiProviderSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات:', error);
      return false;
    }
  };

  // دریافت کلید API برای یک provider خاص
  const getApiKey = (provider: keyof AIProviderSettings): string | null => {
    return settings[provider]?.apiKey || null;
  };

  // دریافت مدل برای یک provider خاص
  const getModel = (provider: keyof AIProviderSettings): string | null => {
    return settings[provider]?.model || null;
  };

  // بررسی اینکه آیا provider تنظیم شده است یا نه
  const isProviderConfigured = (provider: keyof AIProviderSettings): boolean => {
    const apiKey = getApiKey(provider);
    return !!(apiKey && apiKey.trim().length > 0);
  };

  return {
    settings,
    isLoading,
    saveSettings,
    getApiKey,
    getModel,
    isProviderConfigured
  };
};