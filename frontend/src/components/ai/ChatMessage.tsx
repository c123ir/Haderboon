// frontend/src/components/ai/ChatMessage.tsx
// کامپوننت نمایش پیام در چت

import React from 'react';
import { AIMessage } from '../../utils/types';

interface ChatMessageProps {
  message: AIMessage;
}

/**
 * کامپوننت نمایش پیام چت
 * این کامپوننت پیام‌های کاربر و دستیار را نمایش می‌دهد
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.timestamp).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        <div className="text-sm font-vazirmatn">
          {message.content}
        </div>
        <div className={`text-xs mt-1 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {timestamp}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;