"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aiProviderController_1 = require("../controllers/aiProviderController");
const aiApiKeyService_1 = require("../services/aiApiKeyService");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// همه مسیرهای این روتر نیاز به احراز هویت دارند
router.use(authMiddleware_1.protect);
// مسیرهای مدیریت ارائه‌دهندگان AI
router.route('/providers')
    .get(aiProviderController_1.getProviders)
    .post(aiProviderController_1.createProvider);
router.route('/providers/:id')
    .get(aiProviderController_1.getProviderById)
    .put(aiProviderController_1.updateProvider)
    .delete(aiProviderController_1.deleteProvider);
// مسیرهای مدیریت کلیدهای API
router.route('/api-keys')
    .get(aiApiKeyService_1.getApiKeys)
    .post(aiApiKeyService_1.createApiKey);
router.route('/api-keys/:id')
    .get(aiApiKeyService_1.getApiKeyById)
    .put(aiApiKeyService_1.updateApiKey)
    .delete(aiApiKeyService_1.deleteApiKey);
exports.default = router;
