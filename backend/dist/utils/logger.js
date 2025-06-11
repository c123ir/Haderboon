"use strict";
// backend/src/utils/logger.ts
// ماژول لاگر برای ثبت رویدادها و خطاها
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevel = void 0;
/**
 * سطوح لاگ
 */
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["FATAL"] = "FATAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * ماژول لاگر ساده
 */
class Logger {
    /**
     * تنظیم سطح لاگ
     * @param level سطح لاگ
     */
    static setLevel(level) {
        this.currentLevel = level;
    }
    /**
     * ثبت پیام در سطح DEBUG
     * @param message پیام
     * @param data داده‌های اضافی (اختیاری)
     */
    static debug(message, data) {
        if (this.shouldLog(LogLevel.DEBUG)) {
            this.log(LogLevel.DEBUG, message, data);
        }
    }
    /**
     * ثبت پیام در سطح INFO
     * @param message پیام
     * @param data داده‌های اضافی (اختیاری)
     */
    static info(message, data) {
        if (this.shouldLog(LogLevel.INFO)) {
            this.log(LogLevel.INFO, message, data);
        }
    }
    /**
     * ثبت پیام در سطح WARN
     * @param message پیام
     * @param data داده‌های اضافی (اختیاری)
     */
    static warn(message, data) {
        if (this.shouldLog(LogLevel.WARN)) {
            this.log(LogLevel.WARN, message, data);
        }
    }
    /**
     * ثبت پیام در سطح ERROR
     * @param message پیام
     * @param data داده‌های اضافی (اختیاری)
     */
    static error(message, data) {
        if (this.shouldLog(LogLevel.ERROR)) {
            this.log(LogLevel.ERROR, message, data);
        }
    }
    /**
     * ثبت پیام در سطح FATAL
     * @param message پیام
     * @param data داده‌های اضافی (اختیاری)
     */
    static fatal(message, data) {
        if (this.shouldLog(LogLevel.FATAL)) {
            this.log(LogLevel.FATAL, message, data);
        }
    }
    /**
     * بررسی اینکه آیا سطح لاگ مورد نظر باید ثبت شود یا خیر
     * @param level سطح لاگ
     * @returns نتیجه بررسی
     */
    static shouldLog(level) {
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
    static log(level, message, data) {
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
                INFO: '\x1b[32m', // سبز
                WARN: '\x1b[33m', // زرد
                ERROR: '\x1b[31m', // قرمز
                FATAL: '\x1b[35m' // بنفش
            };
            const reset = '\x1b[0m';
            const color = colors[level] || '';
            if (data) {
                console.log(`${color}[${level}]${reset} ${timestamp}: ${message}`, data);
            }
            else {
                console.log(`${color}[${level}]${reset} ${timestamp}: ${message}`);
            }
        }
        else {
            // در محیط تولید، نمایش ساده
            console.log(JSON.stringify(logEntry));
            // در آینده می‌توان از سرویس‌های لاگ خارجی استفاده کرد
            // به عنوان مثال: Winston, Bunyan, Pino و ...
        }
    }
}
/**
 * سطح لاگ فعلی
 */
Logger.currentLevel = LogLevel.INFO;
exports.default = Logger;
