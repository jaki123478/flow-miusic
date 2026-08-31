"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.recordHistory = exports.getLikedTracks = exports.unlikeTrack = exports.likeTrack = exports.getPublicPlaylists = exports.getUserPlaylists = exports.reorderTracks = exports.removeTrack = exports.addTrack = exports.deletePlaylist = exports.updatePlaylist = exports.getPlaylist = exports.createPlaylist = void 0;
const database_1 = __importDefault(require("../config/database"));
const createPlaylist = async (userId, title, description, isPublic = true) => {
    return database_1.default.playlist.create({
        data: { userId, title, description, isPublic }
    });
};
exports.createPlaylist = createPlaylist;
const getPlaylist = async (id) => {
    return database_1.default.playlist.findUnique({
        where: { id },
        include: {
            tracks: { orderBy: { position: 'asc' } },
            user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
        }
    });
};
exports.getPlaylist = getPlaylist;
const updatePlaylist = async (id, userId, data) => {
    return database_1.default.playlist.updateMany({
        where: { id, userId },
        data
    });
};
exports.updatePlaylist = updatePlaylist;
const deletePlaylist = async (id, userId) => {
    return database_1.default.playlist.deleteMany({
        where: { id, userId }
    });
};
exports.deletePlaylist = deletePlaylist;
const addTrack = async (playlistId, userId, trackData) => {
    const playlist = await database_1.default.playlist.findFirst({ where: { id: playlistId, userId } });
    if (!playlist)
        throw new Error('Not found');
    const count = await database_1.default.playlistTrack.count({ where: { playlistId } });
    return database_1.default.playlistTrack.create({
        data: {
            playlistId,
            videoId: trackData.videoId,
            title: trackData.title,
            artist: trackData.artist,
            thumbnailUrl: trackData.thumbnailUrl,
            duration: trackData.duration,
            position: count
        }
    });
};
exports.addTrack = addTrack;
const removeTrack = async (playlistId, trackId, userId) => {
    const playlist = await database_1.default.playlist.findFirst({ where: { id: playlistId, userId } });
    if (!playlist)
        throw new Error('Not found');
    return database_1.default.playlistTrack.delete({
        where: { id: trackId }
    });
};
exports.removeTrack = removeTrack;
const reorderTracks = async (playlistId, userId, trackIds) => {
    const playlist = await database_1.default.playlist.findFirst({ where: { id: playlistId, userId } });
    if (!playlist)
        throw new Error('Not found');
    const updates = trackIds.map((id, index) => database_1.default.playlistTrack.update({
        where: { id },
        data: { position: index }
    }));
    await database_1.default.$transaction(updates);
    return { success: true };
};
exports.reorderTracks = reorderTracks;
const getUserPlaylists = async (userId) => {
    return database_1.default.playlist.findMany({
        where: { userId },
        include: {
            _count: { select: { tracks: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getUserPlaylists = getUserPlaylists;
const getPublicPlaylists = async (userId) => {
    return database_1.default.playlist.findMany({
        where: { userId, isPublic: true },
        include: { _count: { select: { tracks: true } } },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getPublicPlaylists = getPublicPlaylists;
const likeTrack = async (userId, trackData) => {
    return database_1.default.likedTrack.upsert({
        where: { userId_videoId: { userId, videoId: trackData.videoId } },
        update: {},
        create: {
            userId,
            videoId: trackData.videoId,
            title: trackData.title,
            artist: trackData.artist,
            thumbnailUrl: trackData.thumbnailUrl,
            duration: trackData.duration
        }
    });
};
exports.likeTrack = likeTrack;
const unlikeTrack = async (userId, videoId) => {
    return database_1.default.likedTrack.delete({
        where: { userId_videoId: { userId, videoId } }
    });
};
exports.unlikeTrack = unlikeTrack;
const getLikedTracks = async (userId) => {
    return database_1.default.likedTrack.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
};
exports.getLikedTracks = getLikedTracks;
const recordHistory = async (userId, trackData) => {
    return database_1.default.listeningHistory.create({
        data: {
            userId,
            videoId: trackData.videoId,
            title: trackData.title,
            artist: trackData.artist,
            thumbnailUrl: trackData.thumbnailUrl,
            duration: trackData.duration
        }
    });
};
exports.recordHistory = recordHistory;
const getHistory = async (userId) => {
    return database_1.default.listeningHistory.findMany({
        where: { userId },
        orderBy: { playedAt: 'desc' },
        take: 50
    });
};
exports.getHistory = getHistory;
