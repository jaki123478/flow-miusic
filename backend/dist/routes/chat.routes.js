"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_service_1 = require("../services/chat.service");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
// Configurazione upload chat ad alta risoluzione e file originali (fino a 100MB)
const CHAT_UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads', 'chat');
promises_1.default.mkdir(CHAT_UPLOAD_DIR, { recursive: true }).catch(() => { });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, CHAT_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '';
        const uniqueName = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
        cb(null, uniqueName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB per foto, video e documenti
});
router.get('/conversations', async (req, res) => {
    try {
        const conversations = await chat_service_1.ChatService.getConversations(req.user.id);
        res.json({ success: true, data: conversations });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/conversation', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId)
            throw new Error('ID Utente richiesto');
        const conversation = await chat_service_1.ChatService.getOrCreateConversation(req.user.id, userId);
        res.json({ success: true, data: conversation });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get('/messages/:conversationId', async (req, res) => {
    try {
        const cursor = req.query.cursor;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const messages = await chat_service_1.ChatService.getMessages(req.params.conversationId, req.user.id, cursor, limit);
        res.json({ success: true, data: messages });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
router.post('/send', async (req, res) => {
    try {
        const { conversationId, content, messageType, music, storyId, replyToId, replyToContent, replyToSender } = req.body;
        const message = await chat_service_1.ChatService.sendMessage(conversationId, req.user.id, content, messageType, music, storyId, replyToId, replyToContent, replyToSender);
        res.json({ success: true, data: message });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Endpoint per caricare foto, video e file originali in chat
router.post('/upload', upload.single('media'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'Nessun file caricato' });
        }
        const asDocument = req.body.asDocument === 'true' || req.body.asDocument === true;
        const isImage = req.file.mimetype.startsWith('image/');
        const isVideo = req.file.mimetype.startsWith('video/');
        let mediaUrl = `/uploads/chat/${req.file.filename}`;
        let detectedType = asDocument ? 'FILE' : (isVideo ? 'VIDEO' : isImage ? 'IMAGE' : 'FILE');
        // Per immagini standard (non come documento): ottimizza mantenendo risoluzione Ultra-HD
        if (isImage && !asDocument) {
            const hdFilename = `hd_${req.file.filename}.jpg`;
            const targetPath = path_1.default.join(CHAT_UPLOAD_DIR, hdFilename);
            try {
                await (0, sharp_1.default)(req.file.path)
                    .resize(2160, 3840, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 98, chromaSubsampling: '4:4:4', mozjpeg: true })
                    .toFile(targetPath);
                mediaUrl = `/uploads/chat/${hdFilename}`;
                await promises_1.default.unlink(req.file.path).catch(() => { });
            }
            catch {
                // Fallback sul file originale caricato
            }
        }
        res.json({
            success: true,
            data: {
                mediaUrl,
                mediaType: detectedType,
                filename: req.file.originalname,
                size: req.file.size
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/read/:conversationId', async (req, res) => {
    try {
        await chat_service_1.ChatService.markAsRead(req.params.conversationId, req.user.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get('/unread', async (req, res) => {
    try {
        const count = await chat_service_1.ChatService.getUnreadCount(req.user.id);
        res.json({ success: true, data: count });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.delete('/message/:messageId', async (req, res) => {
    try {
        const result = await chat_service_1.ChatService.deleteMessage(req.params.messageId, req.user.id);
        res.json(result);
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
router.post('/message/:messageId/react', async (req, res) => {
    try {
        const { emoji } = req.body;
        const username = req.user.username;
        const updated = await chat_service_1.ChatService.reactToMessage(req.params.messageId, req.user.id, username, emoji);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.put('/conversation/:conversationId/pin', async (req, res) => {
    try {
        const { messageId } = req.body;
        const updated = await chat_service_1.ChatService.pinMessage(req.params.conversationId, req.user.id, messageId || null);
        res.json({ success: true, data: updated });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.post('/group', async (req, res) => {
    try {
        const { name, memberIds, avatarUrl } = req.body;
        const group = await chat_service_1.ChatService.createGroup(req.user.id, name, memberIds || [], avatarUrl);
        res.status(201).json({ success: true, data: group });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.post('/transcribe', async (req, res) => {
    try {
        const { audioUrl } = req.body;
        const transcription = await chat_service_1.ChatService.transcribeAudio(audioUrl);
        res.json({ success: true, data: transcription });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
