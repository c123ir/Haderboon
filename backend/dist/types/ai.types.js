"use strict";
// backend/src/types/ai.types.ts
// تایپ‌های مربوط به ایجنت هوشمند و هوش مصنوعی
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIMessageRole = exports.AIMessageContentType = void 0;
/**
 * نوع محتوای پیام
 */
var AIMessageContentType;
(function (AIMessageContentType) {
    AIMessageContentType["TEXT"] = "text";
    AIMessageContentType["IMAGE"] = "image";
    AIMessageContentType["AUDIO"] = "audio";
    AIMessageContentType["VIDEO"] = "video";
    AIMessageContentType["FILE"] = "file";
})(AIMessageContentType || (exports.AIMessageContentType = AIMessageContentType = {}));
/**
 * نقش پیام
 */
var AIMessageRole;
(function (AIMessageRole) {
    AIMessageRole["USER"] = "user";
    AIMessageRole["ASSISTANT"] = "assistant";
    AIMessageRole["SYSTEM"] = "system";
    AIMessageRole["TOOL"] = "tool";
})(AIMessageRole || (exports.AIMessageRole = AIMessageRole = {}));
