"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredStories = exports.getStoryViewers = exports.reactToStory = exports.viewStory = exports.deleteStory = exports.getStory = exports.getUserStories = exports.getStoryFeed = exports.createStory = void 0;
const database_1 = __importDefault(require("../config/database"));
const sharp_1 = __importDefault(require("sharp"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const socket_1 = require("../websocket/socket");
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads', 'stories');
const createStory = async (userId, mediaFile, data) => {
    await promises_1.default.mkdir(UPLOAD_DIR, { recursive: true });
    const isImage = Boolean(mediaFile.mimetype?.startsWith('image/') ||
        mediaFile.originalname?.match(/\.(jpg|jpeg|png|webp|gif|avif)$/i));
    let mediaUrl;
    if (isImage) {
        const filename = `story_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.jpg`;
        const targetPath = path_1.default.join(UPLOAD_DIR, filename);
        try {
            // Massima qualità fotografica Ultra-HD lossless (fino a 4K 2160x3840, campionamento colore 4:4:4 senza sgranature)
            await (0, sharp_1.default)(mediaFile.path)
                .resize(2160, 3840, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 98, chromaSubsampling: '4:4:4', mozjpeg: true })
                .toFile(targetPath);
            mediaUrl = `/uploads/stories/${filename}`;
        }
        catch (sharpError) {
            // Fallback: copia lossless file originale
            await promises_1.default.copyFile(mediaFile.path, targetPath);
            mediaUrl = `/uploads/stories/${filename}`;
        }
        await promises_1.default.unlink(mediaFile.path).catch(() => { });
    }
    else {
        // Video HD (MP4 / WebM / MOV): salvataggio 100% bitrate nativo senza ricodifica degradante
        const ext = path_1.default.extname(mediaFile.originalname || '') || '.mp4';
        const filename = `story_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
        const targetPath = path_1.default.join(UPLOAD_DIR, filename);
        await promises_1.default.copyFile(mediaFile.path, targetPath);
        await promises_1.default.unlink(mediaFile.path).catch(() => { });
        mediaUrl = `/uploads/stories/${filename}`;
    }
    const story = await database_1.default.story.create({
        data: {
            userId,
            mediaUrl,
            mediaType: isImage ? 'IMAGE' : 'VIDEO',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            musicVideoId: data.musicVideoId || null,
            musicTitle: data.musicTitle || null,
            musicArtist: data.musicArtist || null,
            musicThumbnail: data.musicThumbnail || null,
            musicStartTime: data.musicStartTime ? parseInt(data.musicStartTime) : null,
            musicEndTime: data.musicEndTime ? parseInt(data.musicEndTime) : null,
            lyricsData: data.lyricsData || null,
            textOverlay: data.textOverlay || null,
            isCloseFriends: data.isCloseFriends === 'true' || data.isCloseFriends === true,
            textPosition: data.textPosition || null,
            backgroundColor: data.filter || data.backgroundColor || null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true
                }
            }
        }
    });
    // Notifica in tempo reale tutti i dispositivi connessi
    try {
        (0, socket_1.broadcastEvent)('story:new', story);
    }
    catch {
        // Ignora se socket non inizializzato
    }
    return story;
};
exports.createStory = createStory;
const getStoryFeed = async (userId) => {
    const now = new Date();
    // Recupera tutte le storie attive entro le 24 ore di tutti gli utenti
    const usersWithStories = await database_1.default.user.findMany({
        where: {
            stories: {
                some: { expiresAt: { gt: now } }
            }
        },
        include: {
            stories: {
                where: { expiresAt: { gt: now } },
                orderBy: { createdAt: 'asc' },
                include: {
                    views: userId ? { where: { userId } } : false
                }
            }
        }
    });
    const feed = usersWithStories.map(u => {
        let closeFriendsList = [];
        try {
            closeFriendsList = JSON.parse(u.closeFriends || '[]');
        }
        catch { }
        const visibleStories = u.stories.filter((s) => {
            if (!s.isCloseFriends)
                return true;
            if (!userId)
                return false;
            if (u.id === userId)
                return true; // Proprietario
            return closeFriendsList.includes(userId); // È nella lista amici stretti
        });
        if (visibleStories.length === 0)
            return null;
        const hasUnviewed = userId ? visibleStories.some((s) => !s.views || s.views.length === 0) : true;
        const hasCloseFriends = visibleStories.some((s) => s.isCloseFriends);
        return {
            user: {
                id: u.id,
                username: u.username,
                displayName: u.displayName,
                avatarUrl: u.avatarUrl
            },
            stories: visibleStories,
            hasUnviewed,
            hasCloseFriends,
            latestStoryAt: visibleStories[visibleStories.length - 1]?.createdAt || u.createdAt
        };
    }).filter(Boolean);
    // Ordina: Prima le proprie storie, poi quelle non ancora visualizzate, poi quelle già visualizzate per data
    return feed.sort((a, b) => {
        if (userId) {
            if (a.user.id === userId)
                return -1;
            if (b.user.id === userId)
                return 1;
        }
        if (a.hasUnviewed && !b.hasUnviewed)
            return -1;
        if (!a.hasUnviewed && b.hasUnviewed)
            return 1;
        return new Date(b.latestStoryAt).getTime() - new Date(a.latestStoryAt).getTime();
    });
};
exports.getStoryFeed = getStoryFeed;
const getUserStories = async (userId, viewerId) => {
    const now = new Date();
    const stories = await database_1.default.story.findMany({
        where: {
            userId,
            expiresAt: { gt: now }
        },
        orderBy: { createdAt: 'asc' },
        include: {
            views: viewerId ? { where: { userId: viewerId } } : false
        }
    });
    return stories;
};
exports.getUserStories = getUserStories;
const getStory = async (storyId) => {
    return database_1.default.story.findUnique({
        where: { id: storyId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true
                }
            }
        }
    });
};
exports.getStory = getStory;
const deleteStory = async (userId, storyId) => {
    const story = await database_1.default.story.findUnique({ where: { id: storyId } });
    if (!story || story.userId !== userId) {
        throw new Error('Non autorizzato');
    }
    return database_1.default.story.delete({ where: { id: storyId } });
};
exports.deleteStory = deleteStory;
const viewStory = async (storyId, userId) => {
    return database_1.default.storyView.upsert({
        where: {
            userId_storyId: { userId, storyId }
        },
        update: {},
        create: {
            storyId,
            userId
        }
    });
};
exports.viewStory = viewStory;
const reactToStory = async (storyId, userId, emoji) => {
    return database_1.default.storyReaction.create({
        data: {
            storyId,
            userId,
            emoji
        }
    });
};
exports.reactToStory = reactToStory;
const getStoryViewers = async (storyId, userId) => {
    const story = await database_1.default.story.findUnique({ where: { id: storyId } });
    if (!story || story.userId !== userId) {
        throw new Error('Non autorizzato');
    }
    const views = await database_1.default.storyView.findMany({
        where: { storyId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: { viewedAt: 'desc' }
    });
    return views;
};
exports.getStoryViewers = getStoryViewers;
// Pulizia automatica periodica delle storie scadute oltre le 24 ore
const cleanupExpiredStories = async () => {
    const now = new Date();
    try {
        const expiredStories = await database_1.default.story.findMany({
            where: { expiresAt: { lte: now } },
            select: { id: true, mediaUrl: true }
        });
        if (expiredStories.length === 0)
            return { deleted: 0 };
        for (const story of expiredStories) {
            if (story.mediaUrl) {
                const localPath = path_1.default.join(process.cwd(), story.mediaUrl.replace(/^\//, ''));
                await promises_1.default.unlink(localPath).catch(() => { });
            }
        }
        const deleteResult = await database_1.default.story.deleteMany({
            where: { expiresAt: { lte: now } }
        });
        if (deleteResult.count > 0) {
            console.log(`[Stories] Pulizia automatica completata: ${deleteResult.count} storie scadute eliminate dopo 24h.`);
        }
        return { deleted: deleteResult.count };
    }
    catch (err) {
        console.error('[Stories] Errore pulizia automatica storie:', err);
        return { deleted: 0 };
    }
};
exports.cleanupExpiredStories = cleanupExpiredStories;
