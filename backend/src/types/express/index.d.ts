// backend/src/types/express/index.d.ts
// تعریف تایپ‌های سفارشی برای Express

import { Request } from 'express';

// توسعه دادن تایپ Request در Express برای افزودن کاربر احراز هویت شده
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        username?: string;
      };
    }
  }
} 