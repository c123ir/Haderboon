// Frontend: frontend/src/pages/Chat.tsx
// صفحه چت هوشمند با ایجنت

import React, { useState, useContext, useRef, useEffect } from 'react';
import { ThemeContext } from '../contexts';

const Chat = () => {
  const { darkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'سلام! من ایجنت هوشمند هادربون هستم. چطور می‌تونم کمکتون کنم؟',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: messages.length + 2,
        content: `متشکرم از پیام شما: "${userMessage.content}". من در حال پردازش درخواست شما هستم و به زودی پاسخ کاملی ارائه خواهم داد. آیا می‌خواهید که در مورد موضوع خاصی بیشتر صحبت کنیم؟`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="px-6 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            چت هوشمند
          </h2>
          <p className={`text-xl ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
            با ایجنت خود گفتگو کنید و راهنمایی دریافت کنید
          </p>
        </div>
        
        <div className={`rounded-3xl overflow-hidden backdrop-blur-lg border ${
          darkMode 
            ? 'bg-white bg-opacity-10 border-white border-opacity-20' 
            : 'bg-white bg-opacity-70 border-gray-200'
        }`}>
          {/* Chat Header */}
          <div className={`p-6 border-b ${darkMode ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center ml-4">
                🤖
              </div>
              <div>
                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  ایجنت هادربون
                </h3>
                <p className="text-sm text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full ml-2 animate-pulse"></span>
                  آنلاین و آماده پاسخگویی
                </p>
              </div>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div className="p-6 h-96 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tl-sm'
                      : darkMode
                        ? 'bg-white bg-opacity-15 text-white rounded-tr-sm'
                        : 'bg-gray-100 text-gray-900 rounded-tr-sm'
                  } animate-fadeIn`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' 
                      ? 'text-purple-200' 
                      : darkMode 
                        ? 'text-purple-200' 
                        : 'text-gray-500'
                  }`}>
                    {message.role === 'user' ? 'شما' : 'ایجنت'} • 
                    {new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className={`p-4 rounded-2xl rounded-tr-sm ${
                  darkMode ? 'bg-white bg-opacity-15' : 'bg-gray-100'
                }`}>
                  <div className="flex space-x-1 space-x-reverse">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className={`p-6 border-t ${darkMode ? 'border-white border-opacity-20' : 'border-gray-200'}`}>
            <div className="flex space-x-4 space-x-reverse">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="پیام خود را بنویسید... (Enter برای ارسال)"
                rows={1}
                className={`flex-1 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none ${
                  darkMode 
                    ? 'bg-white bg-opacity-15 text-white placeholder-purple-200' 
                    : 'bg-white text-gray-900 placeholder-gray-500 border border-gray-200'
                }`}
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-2xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setInputMessage('کد پروژه من را تحلیل کن')}
            className={`p-4 rounded-xl text-right transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-20' 
                : 'bg-white bg-opacity-50 border border-gray-200 hover:bg-opacity-80'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl ml-3">🔍</div>
              <div>
                <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  تحلیل کد
                </h4>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                  تحلیل و بررسی کد پروژه
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setInputMessage('مستندات API برای پروژه من تولید کن')}
            className={`p-4 rounded-xl text-right transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-20' 
                : 'bg-white bg-opacity-50 border border-gray-200 hover:bg-opacity-80'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl ml-3">📝</div>
              <div>
                <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  تولید مستندات
                </h4>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                  ایجاد مستندات خودکار
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setInputMessage('بهترین معماری برای پروژه من چیست؟')}
            className={`p-4 rounded-xl text-right transition-all duration-300 hover:scale-105 ${
              darkMode 
                ? 'bg-white bg-opacity-10 border border-white border-opacity-20 hover:bg-opacity-20' 
                : 'bg-white bg-opacity-50 border border-gray-200 hover:bg-opacity-80'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl ml-3">🏗️</div>
              <div>
                <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  مشاوره معماری
                </h4>
                <p className={`text-sm ${darkMode ? 'text-purple-200' : 'text-gray-600'}`}>
                  راهنمایی معماری نرم‌افزار
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;