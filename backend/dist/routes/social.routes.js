"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const social_service_1 = require("../services/social.service");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const sharp_1 = __importDefault(require("sharp"));
const router = (0, express_1.Router)();
const POSTS_UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads', 'posts');
promises_1.default.mkdir(POSTS_UPLOAD_DIR, { recursive: true }).catch(() => { });
const postStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, POSTS_UPLOAD_DIR),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        cb(null, `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`);
    }
});
const uploadPost = (0, multer_1.default)({ storage: postStorage, limits: { fileSize: 50 * 1024 * 1024 } });
// Upload Foto Post ad Alta Risoluzione
router.post('/upload', auth_1.verifyToken, uploadPost.single('image'), async (req, res) => {
    try {
        if (!req.file)
            throw new Error('File non fornito');
        const hdFilename = `hd_${req.file.filename}.jpg`;
        const targetPath = path_1.default.join(POSTS_UPLOAD_DIR, hdFilename);
        try {
            await (0, sharp_1.default)(req.file.path)
                .resize(2160, 2160, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true })
                .toFile(targetPath);
            await promises_1.default.unlink(req.file.path).catch(() => { });
            return res.json({ success: true, data: { imageUrl: `/uploads/posts/${hdFilename}` } });
        }
        catch {
            return res.json({ success: true, data: { imageUrl: `/uploads/posts/${req.file.filename}` } });
        }
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
// Feed principale con optionalAuth (funziona sia per loggati che per ospiti)
router.get('/feed', auth_1.optionalAuth, async (req, res) => {
    try {
        const cursor = req.query.cursor;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const feed = await social_service_1.SocialService.getFeed(req.user?.id, cursor, limit);
        res.json({ success: true, data: feed });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/post', auth_1.verifyToken, async (req, res) => {
    try {
        const { content, imageUrl, music, poll } = req.body;
        const post = await social_service_1.SocialService.createPost(req.user.id, content, imageUrl, music, poll);
        res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/post/:id', auth_1.verifyToken, async (req, res) => {
    try {
        await social_service_1.SocialService.deletePost(req.user.id, req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
router.post('/post/:id/like', auth_1.verifyToken, async (req, res) => {
    try {
        const result = await social_service_1.SocialService.likePost(req.user.id, req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/post/:id/like', auth_1.verifyToken, async (req, res) => {
    try {
        const result = await social_service_1.SocialService.unlikePost(req.user.id, req.params.id);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.post('/post/:id/vote', auth_1.verifyToken, async (req, res) => {
    try {
        const { optionIdx } = req.body;
        const result = await social_service_1.SocialService.votePoll(req.user.id, req.params.id, optionIdx);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get('/post/:id/comments', auth_1.optionalAuth, async (req, res) => {
    try {
        const cursor = req.query.cursor;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const comments = await social_service_1.SocialService.getComments(req.params.id, cursor, limit);
        res.json({ success: true, data: comments });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/post/:id/comment', auth_1.verifyToken, async (req, res) => {
    try {
        const { content, parentId } = req.body;
        const comment = await social_service_1.SocialService.addComment(req.user.id, req.params.id, content, parentId);
        res.status(201).json({ success: true, data: comment });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/comment/:id', auth_1.verifyToken, async (req, res) => {
    try {
        await social_service_1.SocialService.deleteComment(req.user.id, req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
router.post('/follow/:userId', auth_1.verifyToken, async (req, res) => {
    try {
        const result = await social_service_1.SocialService.followUser(req.user.id, req.params.userId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/follow/:userId', auth_1.verifyToken, async (req, res) => {
    try {
        const result = await social_service_1.SocialService.unfollowUser(req.user.id, req.params.userId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.get('/user/:userId/followers', auth_1.optionalAuth, async (req, res) => {
    try {
        const followers = await social_service_1.SocialService.getFollowers(req.params.userId, req.user?.id);
        res.json({ success: true, data: followers });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/user/:userId/following', auth_1.optionalAuth, async (req, res) => {
    try {
        const following = await social_service_1.SocialService.getFollowing(req.params.userId, req.user?.id);
        res.json({ success: true, data: following });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/post/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        const post = await social_service_1.SocialService.getPostById(req.params.id, req.user?.id);
        if (!post)
            return res.status(404).json({ success: false, error: 'Post non trovato' });
        res.json({ success: true, data: post });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/post/:id/likes', auth_1.optionalAuth, async (req, res) => {
    try {
        const likes = await social_service_1.SocialService.getPostLikes(req.params.id);
        res.json({ success: true, data: likes });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/posts/search', auth_1.optionalAuth, async (req, res) => {
    try {
        const q = req.query.q;
        const posts = await social_service_1.SocialService.searchPosts(q, req.user?.id);
        res.json({ success: true, data: posts });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/user/:userId/posts', auth_1.optionalAuth, async (req, res) => {
    try {
        const cursor = req.query.cursor;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const posts = await social_service_1.SocialService.getUserPosts(req.params.userId, req.user?.id, cursor, limit);
        res.json({ success: true, data: posts });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
