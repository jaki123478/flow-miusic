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
const multer_1 = __importDefault(require("multer"));
const storiesService = __importStar(require("../services/stories.service"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/temp/' });
// Creazione storia (richiede auth)
router.post('/', auth_1.verifyToken, upload.single('media'), async (req, res) => {
    try {
        const userId = req.user.id;
        if (!req.file) {
            return res.status(400).json({ error: 'Nessun file multimediale caricato' });
        }
        const story = await storiesService.createStory(userId, req.file, req.body);
        res.json({ success: true, data: story });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message || 'Errore creazione storia' });
    }
});
// Feed storie (accessibile a tutti, personalizzato se loggati)
router.get('/feed', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id;
        const feed = await storiesService.getStoryFeed(userId);
        res.json({ success: true, data: feed });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Storie di un utente specifico
router.get('/user/:userId', auth_1.optionalAuth, async (req, res) => {
    try {
        const stories = await storiesService.getUserStories(req.params.userId, req.user?.id);
        res.json({ success: true, data: stories });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Singola storia
router.get('/:storyId', auth_1.optionalAuth, async (req, res) => {
    try {
        const story = await storiesService.getStory(req.params.storyId);
        if (!story)
            return res.status(404).json({ error: 'Storia non trovata' });
        res.json({ success: true, data: story });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Elimina storia
router.delete('/:storyId', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await storiesService.deleteStory(userId, req.params.storyId);
        res.json({ success: true });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
// Visualizza storia
router.post('/:storyId/view', auth_1.optionalAuth, async (req, res) => {
    try {
        if (req.user?.id) {
            await storiesService.viewStory(req.params.storyId, req.user.id);
        }
        res.json({ success: true });
    }
    catch (error) {
        res.json({ success: false });
    }
});
// Reazione a storia
router.post('/:storyId/reaction', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await storiesService.reactToStory(req.params.storyId, userId, req.body.emoji);
        res.json({ success: true });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Chi ha visto la storia (solo per il proprietario)
router.get('/:storyId/viewers', auth_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const viewers = await storiesService.getStoryViewers(req.params.storyId, userId);
        res.json({ success: true, data: viewers });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
exports.default = router;
