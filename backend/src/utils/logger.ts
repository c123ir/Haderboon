// backend/src/utils/logger.ts
// ماژول لاگر برای ثبت رویدادها و خطاها

/**
 * سطوح لاگ
 */
enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

/**
 * ماژول لاگر ساده
 */
class Logger {
  /**
   * سطح لاگ فعلی
   */
  private static currentLevel: LogLevel = LogLevel.INFO;
  
  /**
   * تنظیم سطح لاگ
   * @param level سطح لاگ
   */
  static setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }
  
  /**
   * ثبت پیام در سطح DEBUG
   * @param message پیام
   * @param data داده‌های اضافی (اختیاری)
   */
  static debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }
  
  /**
   * ثبت پیام در سطح INFO
   * @param message پیام
   * @param data داده‌های اضافی (اختیاری)
   */
  static info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, data);
    }
  }
  
  /**
   * ثبت پیام در سطح WARN
   * @param message پیام
   * @param data داده‌های اضافی (اختیاری)
   */
  static warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, data);
    }
  }
  
  /**
   * ثبت پیام در سطح ERROR
   * @param message پیام
   * @param data داده‌های اضافی (اختیاری)
   */
  static error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.log(LogLevel.ERROR, message, data);
    }
  }
  
  /**
   * ثبت پیام در سطح FATAL
   * @param message پیام
   * @param data داده‌های اضافی (اختیاری)
   */
  static fatal(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      this.log(LogLevel.FATAL, message, data);
    }
  }
  
  /**
   * بررسی اینکه آیا سطح لاگ مورد نظر باید ثبت شود یا خیر
   * @param level سطح لاگ
   * @returns نتیجه بررسی
   */
  private static shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentIndex = levels.indexOf(this.currentLevel);
    const levelIndex = levels.indexOf(level);
    
    return levelIndex >= currentIndex;
  }
  
  /**
   * ثبت پیام در کنسول
   * @param level سطح لاگ
   * @param message پیام
   * @param data داده‌های اضافی (اختیاری)
   */
  private static log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    // در محیط توسعه، نمایش رنگی
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        DEBUG: '\x1b[36m', // آبی روشن
        INFO: '\x1b[32m',  // سبز
        WARN: '\x1b[33m',  // زرد
        ERROR: '\x1b[31m', // قرمز
        FATAL: '\x1b[35m'  // بنفش
      };
      
      const reset = '\x1b[0m';
      const color = colors[level] || '';
      
      if (data) {
        console.log(`${color}[${level}]${reset} ${timestamp}: ${message}`, data);
      } else {
        console.log(`${color}[${level}]${reset} ${timestamp}: ${message}`);
      }
    } else {
      // در محیط تولید، نمایش ساده
      console.log(JSON.stringify(logEntry));
      
      // در آینده می‌توان از سرویس‌های لاگ خارجی استفاده کرد
      // به عنوان مثال: Winston, Bunyan, Pino و ...
    }
  }
}

export default Logger;
export { LogLevel }; 