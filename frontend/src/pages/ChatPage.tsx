// frontend/src/pages/ChatPage.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PaperAirplaneIcon,
  ArrowLeftIcon,
  UserIcon,
  SparklesIcon,
  PlusIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { getProjectById, mockChatSessions, mockChatMessages } from '../utils/mockData';
import { ChatMessage } from '../types';

const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id || '');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentMessage]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId: 'session1',
      role: 'user',
      content: currentMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sessionId: 'session1',
        role: 'assistant',
        content: `متشکرم از سوال شما. درباره "${currentMessage}" می‌توانم بگویم که بر اساس تحلیل پروژه ${project?.name}، این موضوع قابل بررسی است. آیا سوال خاص‌تری دارید؟`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'ساختار کلی این پروژه چگونه است؟',
    'کدام فایل‌ها مهم‌ترین بخش‌های پروژه هستند؟',
    'چه بهبودهایی می‌توانم در کد اعمال کنم؟',
    'آیا مشکل امنیتی خاصی در پروژه وجود دارد؟',
  ];

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-white mb-2">پروژه یافت نشد</h2>
        <Link to="/projects" className="text-blue-400 hover:text-blue-300">
          بازگشت به پروژه‌ها
        </Link>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="glass-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to={`/projects/${project.id}`}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 ml-3"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">
                چت با هادربون - {project.name}
              </h1>
              <p className="text-white/60 text-sm">
                سوالات خود درباره پروژه را بپرسید
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
              <PlusIcon className="w-5 h-5 text-white/60" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
              <EllipsisVerticalIcon className="w-5 h-5 text-white/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex">
        {/* Chat History Sidebar */}
        <div className="w-64 glass-card ml-6 p-4">
          <h3 className="text-white font-semibold mb-4">تاریخچه چت‌ها</h3>
          <div className="space-y-2">
            {mockChatSessions.map((session) => (
              <button
                key={session.id}
                className="w-full text-right p-3 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <p className="text-white text-sm font-medium truncate">
                  {session.title}
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {new Date(session.createdAt).toLocaleDateString('fa-IR')}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 glass-card mb-4 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <SparklesIcon className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    سلام! من هادربون هستم
                  </h3>
                  <p className="text-white/60 mb-6">
                    چه چیزی درباره پروژه {project.name} می‌خواهید بدانید؟
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentMessage(question)}
                        className="p-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white/80 text-sm transition-colors duration-200 text-right"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-white border border-white/20'
                        }`}
                      >
                        <div className="flex items-start space-x-2 space-x-reverse mb-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            message.role === 'user' ? 'bg-blue-700' : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}>
                            {message.role === 'user' ? (
                              <UserIcon className="w-4 h-4" />
                            ) : (
                              <SparklesIcon className="w-4 h-4" />
                            )}
                          </div>
                          <span className="text-xs text-white/60">
                            {message.role === 'user' ? 'شما' : 'هادربون'}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className="text-xs text-white/40 mt-2">
                          {new Date(message.createdAt).toLocaleTimeString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-xs p-4 bg-white/10 border border-white/20 rounded-lg">
                        <div className="flex items-center space-x-2 space-x-reverse mb-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                            <SparklesIcon className="w-4 h-4" />
                          </div>
                          <span className="text-xs text-white/60">هادربون</span>
                        </div>
                        <div className="flex space-x-1 space-x-reverse">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="glass-card p-4">
            <div className="flex items-end space-x-3 space-x-reverse">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="سوال خود را بپرسید..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none min-h-[44px] max-h-32"
                  rows={1}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Quick Actions */}
            {messages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  onClick={() => setCurrentMessage('این کد چطور کار می‌کنه؟')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-full transition-colors duration-200"
                >
                  این کد چطور کار می‌کنه؟
                </button>
                <button
                  onClick={() => setCurrentMessage('چه بهبودهایی پیشنهاد می‌دی؟')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-full transition-colors duration-200"
                >
                  چه بهبودهایی پیشنهاد می‌دی؟
                </button>
                <button
                  onClick={() => setCurrentMessage('مستندات این بخش رو بساز')}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 text-sm rounded-full transition-colors duration-200"
                >
                  مستندات این بخش رو بساز
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;