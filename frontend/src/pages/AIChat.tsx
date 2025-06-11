// frontend/src/pages/AIChat.tsx
// صفحه اصلی چت هوشمند

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import aiService from '../services/aiService';
import { AISession, AIMessage } from '../utils/types';
import SessionList from '../components/ai/SessionList';
import ChatMessage from '../components/ai/ChatMessage';
import ChatInput from '../components/ai/ChatInput';
import { useSettings } from '../hooks/useSettings';

/**
 * صفحه چت هوشمند
 * این صفحه امکان گفتگو با ایجنت هوشمند هادربون را فراهم می‌کند
 */
const AIChat: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings, getApiKey, getModel, isProviderConfigured } = useSettings();

  // State مدیریت جلسات و پیام‌ها
  const [sessions, setSessions] = useState<AISession[]>([]);
  const [currentSession, setCurrentSession] = useState<AISession | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'anthropic' | 'google'>('openai');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // هدایت به صفحه ورود اگر کاربر احراز هویت نشده است
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // بارگذاری جلسات کاربر
  useEffect(() => {
    if (isAuthenticated && !loading) {
      loadSessions();
    }
  }, [isAuthenticated, loading]);

  // اسکرول خودکار به انتهای پیام‌ها
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const sessionsData = await aiService.getSessions();
      // اطمینان از اینکه sessionsData یک آرایه است
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      
      // انتخاب آخرین جلسه به عنوان جلسه فعال
      if (Array.isArray(sessionsData) && sessionsData.length > 0) {
        const latestSession = sessionsData[0];
        setCurrentSession(latestSession);
        setMessages(latestSession.messages || []);
      }
    } catch (error) {
      console.error('خطا در بارگذاری جلسات:', error);
      // در صورت خطا، sessions را به آرایه خالی تنظیم کن
      setSessions([]);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleNewSession = async () => {
    try {
      const newSession = await aiService.createSession('چت جدید');
      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setMessages([]);
    } catch (error) {
      console.error('خطا در ایجاد جلسه جدید:', error);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const session = await aiService.getSession(sessionId);
      setCurrentSession(session);
      setMessages(session.messages || []);
    } catch (error) {
      console.error('خطا در بارگذاری جلسه:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await aiService.deleteSession(sessionId);
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      // اگر جلسه فعلی حذف شد، جلسه جدیدی انتخاب کن
      if (currentSession?.id === sessionId) {
        if (updatedSessions.length > 0) {
          handleSelectSession(updatedSessions[0].id);
        } else {
          setCurrentSession(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('خطا در حذف جلسه:', error);
    }
  };

  // تنظیم مدل پیش‌فرض بر اساس provider انتخاب شده
  useEffect(() => {
    const model = getModel(selectedProvider);
    if (model) {
      setSelectedModel(model);
    }
  }, [selectedProvider, getModel]);

  const handleSendMessage = async (messageContent: string) => {
    if (!currentSession) {
      await handleNewSession();
      return;
    }

    // بررسی اینکه provider انتخاب شده پیکربندی شده باشد
    if (!isProviderConfigured(selectedProvider)) {
      alert(`لطفاً ابتدا کلید API برای ${selectedProvider} را در تنظیمات وارد کنید.`);
      navigate('/settings');
      return;
    }

    try {
      setIsLoading(true);
      
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        content: messageContent,
        role: 'user',
        timestamp: new Date(),
        sessionId: currentSession.id
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // ارسال پیام با مدل انتخاب شده
      const response = await aiService.sendMessage({
        message: messageContent,
        sessionId: currentSession.id,
        modelId: selectedModel,
        providerId: selectedProvider
      });
      
      setMessages(prev => [...prev, response.message]);
      setCurrentSession(response.session);
      setSessions(prev => 
        prev.map(s => s.id === response.session.id ? response.session : s)
      );
      
    } catch (error) {
      console.error('خطا در ارسال پیام:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // نمایش اسپینر در حالت بارگذاری
  if (loading || isLoadingSessions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* سایدبار جلسات */}
      <SessionList
        sessions={sessions}
        currentSessionId={currentSession?.id}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
      />

      {/* منطقه اصلی چت */}
      <div className="flex-1 flex flex-col">
        // در بخش JSX، قبل از منطقه پیام‌ها:
        {/* هدر */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800 font-vazirmatn">
              {currentSession ? currentSession.title : 'چت هوشمند هادربون'}
            </h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-vazirmatn"
            >
              بازگشت به داشبورد
            </button>
          </div>
          
          {/* انتخابگر مدل */}
          <div className="flex gap-4 items-center">
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700 font-vazirmatn">ارائه‌دهنده:</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value as 'openai' | 'anthropic' | 'google')}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-vazirmatn"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="google">Google AI</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700 font-vazirmatn">مدل:</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm font-vazirmatn"
                disabled={!isProviderConfigured(selectedProvider)}
              >
                {selectedProvider === 'openai' && (
                  <>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  </>
                )}
                {selectedProvider === 'anthropic' && (
                  <>
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </>
                )}
                {selectedProvider === 'google' && (
                  <>
                    <option value="gemini-pro">Gemini Pro</option>
                    <option value="gemini-pro-vision">Gemini Pro Vision</option>
                  </>
                )}
              </select>
            </div>
            
            {!isProviderConfigured(selectedProvider) && (
              <div className="text-sm text-red-600 font-vazirmatn">
                <span>کلید API تنظیم نشده - </span>
                <button
                  onClick={() => navigate('/settings')}
                  className="underline hover:text-red-800"
                >
                  تنظیمات
                </button>
              </div>
            )}
          </div>
        </div>

        {/* منطقه پیام‌ها */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <h2 className="text-2xl font-bold mb-2 font-vazirmatn">خوش آمدید به چت هوشمند هادربون!</h2>
                <p className="font-vazirmatn">برای شروع گفتگو، پیام خود را بنویسید.</p>
              </div>
            </div>
          ) : (
            <div>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ورودی پیام */}
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AIChat;