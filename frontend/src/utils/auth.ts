// frontend/src/utils/auth.ts
// توابع کمکی مرتبط با احراز هویت

/**
 * دریافت توکن احراز هویت از localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * ذخیره توکن احراز هویت در localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

/**
 * حذف توکن احراز هویت از localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

/**
 * بررسی اعتبار توکن (به صورت ساده)
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
 * دریافت هدر Authorization برای درخواست‌های API
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}; 