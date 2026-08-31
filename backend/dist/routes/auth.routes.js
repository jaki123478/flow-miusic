"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_service_1 = require("../services/auth.service");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const router = (0, express_1.Router)();
const AVATAR_DIR = path_1.default.join(process.cwd(), 'uploads', 'avatars');
const BANNER_DIR = path_1.default.join(process.cwd(), 'uploads', 'banners');
promises_1.default.mkdir(AVATAR_DIR, { recursive: true }).catch(() => { });
promises_1.default.mkdir(BANNER_DIR, { recursive: true }).catch(() => { });
const avatarStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        cb(null, `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
    }
});
const bannerStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, BANNER_DIR),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        cb(null, `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
    }
});
const uploadAvatar = (0, multer_1.default)({ storage: avatarStorage, limits: { fileSize: 10 * 1024 * 1024 } });
const uploadBanner = (0, multer_1.default)({ storage: bannerStorage, limits: { fileSize: 20 * 1024 * 1024 } });
const registerSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    displayName: zod_1.z.string().min(1),
});
router.post('/register', async (req, res) => {
    try {
        const data = registerSchema.parse(req.body);
        const result = await auth_service_1.AuthService.register(data.username, data.email, data.password, data.displayName);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const identifier = req.body.login || req.body.email || req.body.username;
        const password = req.body.password;
        if (!identifier || !password) {
            return res.status(400).json({ success: false, error: 'Inserisci username/email e password' });
        }
        const result = await auth_service_1.AuthService.login(identifier, password);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken)
            throw new Error('Refresh token mancante');
        const tokens = await auth_service_1.AuthService.refreshToken(refreshToken);
        res.json({ success: true, data: tokens });
    }
    catch (error) {
        res.status(401).json({ success: false, error: error.message });
    }
});
router.get('/me', auth_1.verifyToken, async (req, res) => {
    try {
        const profile = await auth_service_1.AuthService.getProfile(req.user.id);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});
// Modifica Profilo Completa (Bio, Nome, Canzone Profilo, Banner)
router.put('/profile', auth_1.verifyToken, async (req, res) => {
    try {
        const updated = await auth_service_1.AuthService.updateProfile(req.user.id, req.body);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Upload Avatar da Galleria
router.post('/avatar', auth_1.verifyToken, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        if (!req.file)
            throw new Error('File avatar non fornito');
        const hdFilename = `hd_${req.file.filename}.jpg`;
        const targetPath = path_1.default.join(AVATAR_DIR, hdFilename);
        try {
            await (0, sharp_1.default)(req.file.path)
                .resize(800, 800, { fit: 'cover' })
                .jpeg({ quality: 95 })
                .toFile(targetPath);
            await promises_1.default.unlink(req.file.path).catch(() => { });
            const avatarUrl = `/uploads/avatars/${hdFilename}`;
            const updated = await auth_service_1.AuthService.updateProfile(req.user.id, { avatarUrl });
            return res.json({ success: true, data: updated });
        }
        catch {
            const avatarUrl = `/uploads/avatars/${req.file.filename}`;
            const updated = await auth_service_1.AuthService.updateProfile(req.user.id, { avatarUrl });
            return res.json({ success: true, data: updated });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Upload Banner da Galleria
router.post('/banner', auth_1.verifyToken, uploadBanner.single('banner'), async (req, res) => {
    try {
        if (!req.file)
            throw new Error('File banner non fornito');
        const hdFilename = `hd_${req.file.filename}.jpg`;
        const targetPath = path_1.default.join(BANNER_DIR, hdFilename);
        try {
            await (0, sharp_1.default)(req.file.path)
                .resize(1920, 600, { fit: 'cover' })
                .jpeg({ quality: 95 })
                .toFile(targetPath);
            await promises_1.default.unlink(req.file.path).catch(() => { });
            const bannerUrl = `/uploads/banners/${hdFilename}`;
            const updated = await auth_service_1.AuthService.updateProfile(req.user.id, { bannerUrl });
            return res.json({ success: true, data: updated });
        }
        catch {
            const bannerUrl = `/uploads/banners/${req.file.filename}`;
            const updated = await auth_service_1.AuthService.updateProfile(req.user.id, { bannerUrl });
            return res.json({ success: true, data: updated });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Note 24h con Musica (Stile Instagram Notes)
router.get('/notes', auth_1.optionalAuth, async (_req, res) => {
    try {
        const notes = await auth_service_1.AuthService.getActiveNotes();
        res.json({ success: true, data: notes });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/notes', auth_1.verifyToken, async (req, res) => {
    try {
        const note = await auth_service_1.AuthService.createNote(req.user.id, req.body);
        res.status(201).json({ success: true, data: note });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get('/user/:username', auth_1.optionalAuth, async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const profile = await auth_service_1.AuthService.getUserByUsername(req.params.username, currentUserId);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});
router.get('/search', auth_1.optionalAuth, async (req, res) => {
    try {
        const q = req.query.q;
        const currentUserId = req.user?.id;
        const users = await auth_service_1.AuthService.searchUsers(q || '', currentUserId);
        res.json({ success: true, data: users });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Registrazione Token Firebase Cloud Messaging (FCM)
router.post('/fcm-token', auth_1.verifyToken, async (req, res) => {
    try {
        const { token } = req.body;
        if (!token)
            throw new Error('Token FCM richiesto');
        const { FCMService } = await Promise.resolve().then(() => __importStar(require('../services/fcm.service')));
        await FCMService.saveToken(req.user.id, token);
        res.json({ success: true, message: 'Token FCM registrato' });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Creator Insights
router.get('/insights', auth_1.verifyToken, async (req, res) => {
    try {
        const insights = await auth_service_1.AuthService.getCreatorInsights(req.user.id);
        res.json({ success: true, data: insights });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Close Friends
router.get('/close-friends', auth_1.verifyToken, async (req, res) => {
    try {
        const friends = await auth_service_1.AuthService.getCloseFriends(req.user.id);
        res.json({ success: true, data: friends });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/close-friends/:targetUserId', auth_1.verifyToken, async (req, res) => {
    try {
        const result = await auth_service_1.AuthService.toggleCloseFriend(req.user.id, req.params.targetUserId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
exports.default = router;
