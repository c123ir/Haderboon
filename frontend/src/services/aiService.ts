// frontend/src/services/aiService.ts
// سرویس مربوط به چت هوشمند

import api from './api';
import { AIChatRequest, AIChatResponse, AISession, AIMessage } from '../utils/types';

class AIService {
  /**
   * ارسال پیام به چت هوشمند
   * @param data - درخواست چت شامل پیام، شناسه جلسه، مدل و ارائه‌دهنده
   * @returns Promise<{message: AIMessage, session: AISession}> - پاسخ چت هوشمند
   */
  async sendMessage(data: {
    message: string;
    sessionId: string;
    modelId?: string;
    providerId?: string;
  }): Promise<{
    message: AIMessage;
    session: AISession;
  }> {
    const response = await api.post('/ai/chat', {
      message: data.message,
      sessionId: data.sessionId,
      modelId: data.modelId,
      providerId: data.providerId
    });
    return response.data;
  }

  /**
   * دریافت تمام جلسات چت کاربر
   * @returns Promise<AISession[]> - لیست جلسات چت
   */
  async getSessions(): Promise<AISession[]> {
    const response = await api.get('/ai/sessions');
    return response.data;
  }

  /**
   * دریافت جزئیات یک جلسه چت
   * @param sessionId - شناسه جلسه
   * @returns Promise<AISession> - جزئیات جلسه
   */
  async getSession(sessionId: string): Promise<AISession> {
    const response = await api.get(`/ai/sessions/${sessionId}`);
    return response.data;
  }

  /**
   * ایجاد جلسه چت جدید
   * @param title - عنوان جلسه
   * @returns Promise<AISession> - جلسه ایجاد شده
   */
  async createSession(title: string): Promise<AISession> {
    const response = await api.post('/ai/sessions', { title });
    return response.data;
  }

  /**
   * حذف جلسه چت
   * @param sessionId - شناسه جلسه
   * @returns Promise<void>
   */
  async deleteSession(sessionId: string): Promise<void> {
    await api.delete(`/ai/sessions/${sessionId}`);
  }

  /**
   * به‌روزرسانی عنوان جلسه
   * @param sessionId - شناسه جلسه
   * @param title - عنوان جدید
   * @returns Promise<AISession> - جلسه به‌روزرسانی شده
   */
  async updateSessionTitle(sessionId: string, title: string): Promise<AISession> {
    const response = await api.put(`/ai/sessions/${sessionId}`, { title });
    return response.data;
  }
}

export default new AIService();