// frontend/src/hooks/useAuth.ts
// این فایل شامل هوک سفارشی برای دسترسی آسان به کانتکست احراز هویت است

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextType } from '../utils/types';

// هوک سفارشی برای دسترسی به کانتکست احراز هویت
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth باید درون AuthProvider استفاده شود');
  }
  
  return context;
}; 