// frontend/src/components/ai/SessionList.tsx
// کامپوننت لیست جلسات چت

import React from 'react';
import { AISession } from '../../utils/types';

interface SessionListProps {
  sessions: AISession[];
  currentSessionId?: string;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

/**
 * کامپوننت لیست جلسات چت
 * این کامپوننت لیست جلسات چت کاربر را نمایش می‌دهد
 */
export const SessionList: React.FC<SessionListProps> = ({
  sessions = [], // مقدار پیش‌فرض
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession
}) => {
  // اطمینان از اینکه sessions یک آرایه است
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* هدر */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewSession}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 font-vazirmatn"
        >
          چت جدید
        </button>
      </div>

      {/* لیست جلسات */}
      <div className="flex-1 overflow-y-auto">
        {safeSessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 font-vazirmatn">
            هیچ جلسه‌ای وجود ندارد
          </div>
        ) : (
          safeSessions.map((session) => (
            <div
              key={session.id}
              className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 ${
                currentSessionId === session.id ? 'bg-blue-50 border-r-4 border-r-blue-600' : ''
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-800 font-vazirmatn truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(session.updatedAt).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="حذف جلسه"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;