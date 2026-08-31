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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playlistService = __importStar(require("../services/playlist.service"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Route pubbliche
router.get('/user/:userId', auth_1.optionalAuth, async (req, res) => {
    const playlists = await playlistService.getPublicPlaylists(req.params.userId);
    res.json(playlists);
});
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    const playlist = await playlistService.getPlaylist(req.params.id);
    res.json(playlist);
});
// Route protette (richiedono login)
router.use(auth_1.verifyToken);
router.post('/', async (req, res) => {
    const { title, description, isPublic } = req.body;
    const playlist = await playlistService.createPlaylist(req.user.id, title, description, isPublic);
    res.json(playlist);
});
router.get('/my', async (req, res) => {
    const playlists = await playlistService.getUserPlaylists(req.user.id);
    res.json(playlists);
});
router.put('/:id', async (req, res) => {
    await playlistService.updatePlaylist(req.params.id, req.user.id, req.body);
    res.json({ success: true });
});
router.delete('/:id', async (req, res) => {
    await playlistService.deletePlaylist(req.params.id, req.user.id);
    res.json({ success: true });
});
router.post('/:id/tracks', async (req, res) => {
    try {
        const track = await playlistService.addTrack(req.params.id, req.user.id, req.body);
        res.json(track);
    }
    catch (err) {
        res.status(403).json({ error: 'Unauthorized' });
    }
});
router.delete('/:id/tracks/:trackId', async (req, res) => {
    try {
        await playlistService.removeTrack(req.params.id, req.params.trackId, req.user.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(403).json({ error: 'Unauthorized' });
    }
});
router.put('/:id/reorder', async (req, res) => {
    try {
        await playlistService.reorderTracks(req.params.id, req.user.id, req.body.trackIds);
        res.json({ success: true });
    }
    catch (err) {
        res.status(403).json({ error: 'Unauthorized' });
    }
});
router.post('/liked/:videoId', async (req, res) => {
    const track = await playlistService.likeTrack(req.user.id, { videoId: req.params.videoId, ...req.body });
    res.json(track);
});
router.delete('/liked/:videoId', async (req, res) => {
    await playlistService.unlikeTrack(req.user.id, req.params.videoId);
    res.json({ success: true });
});
router.get('/liked', async (req, res) => {
    const tracks = await playlistService.getLikedTracks(req.user.id);
    res.json(tracks);
});
router.post('/history', async (req, res) => {
    const record = await playlistService.recordHistory(req.user.id, req.body);
    res.json(record);
});
router.get('/history', async (req, res) => {
    const history = await playlistService.getHistory(req.user.id);
    res.json(history);
});
exports.default = router;
