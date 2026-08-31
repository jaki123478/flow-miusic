"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchLyrics = exports.getPlainLyrics = exports.getSyncedLyrics = void 0;
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../config/redis"));
const lrcParser_1 = require("../utils/lrcParser");
const USER_AGENT = 'SocialFlow/1.0.0 (https://socialflow.app)';
const getSyncedLyrics = async (videoId, trackName, artistName, albumName, duration) => {
    try {
        const cacheKey = `lyrics:${videoId}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const headers = { 'User-Agent': USER_AGENT };
        // 1. Try exact match
        let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
        if (albumName)
            url += `&album_name=${encodeURIComponent(albumName)}`;
        if (duration)
            url += `&duration=${duration}`;
        let response = await axios_1.default.get(url, { headers, validateStatus: () => true });
        if (response.status === 429) {
            // Basic handling, ideally implement delay and retry based on Retry-After
            return null;
        }
        if (response.status === 200 && response.data?.syncedLyrics) {
            const parsed = (0, lrcParser_1.parseLRC)(response.data.syncedLyrics);
            await redis_1.default.setex(cacheKey, 86400, JSON.stringify(parsed));
            return parsed;
        }
        // 2. Try generic search
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${artistName} ${trackName}`)}`;
        response = await axios_1.default.get(searchUrl, { headers });
        if (response.status === 200 && Array.isArray(response.data)) {
            const bestMatch = response.data.find(item => item.syncedLyrics);
            if (bestMatch) {
                const parsed = (0, lrcParser_1.parseLRC)(bestMatch.syncedLyrics);
                await redis_1.default.setex(cacheKey, 86400, JSON.stringify(parsed));
                return parsed;
            }
        }
        return null;
    }
    catch (error) {
        console.error('Error fetching lyrics', error);
        return null;
    }
};
exports.getSyncedLyrics = getSyncedLyrics;
const getPlainLyrics = async (videoId, trackName, artistName) => {
    try {
        const headers = { 'User-Agent': USER_AGENT };
        const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
        const response = await axios_1.default.get(url, { headers });
        return response.data?.plainLyrics || null;
    }
    catch (error) {
        return null;
    }
};
exports.getPlainLyrics = getPlainLyrics;
const searchLyrics = async (query) => {
    try {
        const headers = { 'User-Agent': USER_AGENT };
        const response = await axios_1.default.get(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`, { headers });
        return response.data;
    }
    catch (error) {
        return [];
    }
};
exports.searchLyrics = searchLyrics;
