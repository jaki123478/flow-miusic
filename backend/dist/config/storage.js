"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_LIMITS = exports.UPLOAD_DIR = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.UPLOAD_DIR = process.env.UPLOAD_DIR || path_1.default.join(__dirname, '../../uploads');
// Assicurati che la directory esista
if (!fs_1.default.existsSync(exports.UPLOAD_DIR)) {
    fs_1.default.mkdirSync(exports.UPLOAD_DIR, { recursive: true });
    fs_1.default.mkdirSync(path_1.default.join(exports.UPLOAD_DIR, 'avatars'), { recursive: true });
    fs_1.default.mkdirSync(path_1.default.join(exports.UPLOAD_DIR, 'posts'), { recursive: true });
    fs_1.default.mkdirSync(path_1.default.join(exports.UPLOAD_DIR, 'stories'), { recursive: true });
}
exports.FILE_LIMITS = {
    AVATAR: 5 * 1024 * 1024, // 5MB
    POST_IMAGE: 10 * 1024 * 1024, // 10MB
    STORY_MEDIA: 50 * 1024 * 1024, // 50MB
};
