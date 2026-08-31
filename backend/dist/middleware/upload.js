"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadStoryMedia = exports.uploadPostImage = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const storage_1 = require("../config/storage");
const createStorage = (subfolder) => {
    return multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path_1.default.join(storage_1.UPLOAD_DIR, subfolder));
        },
        filename: (req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            cb(null, `${(0, uuid_1.v4)()}${ext}`);
        },
    });
};
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo immagini sono permesse'));
    }
};
const mediaFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo immagini o video sono permessi'));
    }
};
exports.uploadAvatar = (0, multer_1.default)({
    storage: createStorage('avatars'),
    limits: { fileSize: storage_1.FILE_LIMITS.AVATAR },
    fileFilter: imageFilter,
});
exports.uploadPostImage = (0, multer_1.default)({
    storage: createStorage('posts'),
    limits: { fileSize: storage_1.FILE_LIMITS.POST_IMAGE },
    fileFilter: imageFilter,
});
exports.uploadStoryMedia = (0, multer_1.default)({
    storage: createStorage('stories'),
    limits: { fileSize: storage_1.FILE_LIMITS.STORY_MEDIA },
    fileFilter: mediaFilter,
});
