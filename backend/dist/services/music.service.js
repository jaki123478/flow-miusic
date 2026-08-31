"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArtist = exports.getAlbum = exports.getRadio = exports.getExplore = exports.getTrending = exports.getHome = exports.getTrackInfo = exports.getStreamUrl = exports.getSearchSuggestions = exports.search = exports.initialize = void 0;
const youtubei_js_1 = require("youtubei.js");
const youtube_sr_1 = __importDefault(require("youtube-sr"));
const redis_1 = __importDefault(require("../config/redis"));
let ytIos = null;
let ytWeb = null;
const initialize = async () => {
    try {
        ytIos = await youtubei_js_1.Innertube.create({
            client_type: youtubei_js_1.ClientType.IOS,
            cache: new youtubei_js_1.UniversalCache(false)
        });
        console.log('✅ Innertube (iOS Client) inizializzato per audio streaming');
    }
    catch (error) {
        console.error('Failed to initialize iOS Innertube', error);
    }
    try {
        ytWeb = await youtubei_js_1.Innertube.create({
            client_type: youtubei_js_1.ClientType.WEB,
            cache: new youtubei_js_1.UniversalCache(false)
        });
        console.log('✅ Innertube (Web Client) inizializzato per search fallback');
    }
    catch (error) {
        console.error('Failed to initialize Web Innertube', error);
    }
};
exports.initialize = initialize;
const DEFAULT_HITS = [
    { videoId: 'kJQP7kiw5Fk', title: 'Despacito', artist: 'Luis Fonsi ft. Daddy Yankee', duration: 228, thumbnailUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg' },
    { videoId: 'JGwWNGJdvx8', title: 'Shape of You', artist: 'Ed Sheeran', duration: 233, thumbnailUrl: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' },
    { videoId: 'OPf0YbXqDm0', title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', duration: 270, thumbnailUrl: 'https://i.ytimg.com/vi/OPf0YbXqDm0/hqdefault.jpg' },
    { videoId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', duration: 359, thumbnailUrl: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg' },
    { videoId: '9bZkp7q19f0', title: 'Gangnam Style', artist: 'PSY', duration: 252, thumbnailUrl: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg' },
    { videoId: 'RgKAFK5djSk', title: 'See You Again', artist: 'Wiz Khalifa ft. Charlie Puth', duration: 237, thumbnailUrl: 'https://i.ytimg.com/vi/RgKAFK5djSk/hqdefault.jpg' },
    { videoId: '09R8_2nJtjg', title: 'Sugar', artist: 'Maroon 5', duration: 235, thumbnailUrl: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg' },
    { videoId: 'hT_nvWreIhg', title: 'Counting Stars', artist: 'OneRepublic', duration: 257, thumbnailUrl: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg' },
    { videoId: 'uelHwf8o7_U', title: 'Love The Way You Lie', artist: 'Eminem ft. Rihanna', duration: 266, thumbnailUrl: 'https://i.ytimg.com/vi/uelHwf8o7_U/hqdefault.jpg' },
    { videoId: 'k2qgadSvNyU', title: 'New Rules', artist: 'Dua Lipa', duration: 209, thumbnailUrl: 'https://i.ytimg.com/vi/k2qgadSvNyU/hqdefault.jpg' }
];
const search = async (query, filter) => {
    const cleanQuery = (query || '').trim() || 'Top Hits Italia 2026';
    const cacheKey = `search:${cleanQuery}:${filter || 'all'}`;
    try {
        const cached = await redis_1.default.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
    }
    catch { }
    let formatted = [];
    // Metodo 1: youtube-sr
    try {
        const searchType = filter === 'playlist' ? 'playlist' : 'video';
        const results = await youtube_sr_1.default.search(cleanQuery, {
            limit: 25,
            type: searchType,
            safeSearch: false
        });
        if (results && results.length > 0) {
            formatted = results.map(item => ({
                videoId: item.id || '',
                title: item.title || '',
                artist: item.channel?.name || 'Artista Sconosciuto',
                album: 'YouTube Music',
                duration: Math.round((item.duration || 0) / 1000),
                thumbnailUrl: item.thumbnail?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
                views: item.views || 0,
                uploadedAt: item.uploadedAt || ''
            })).filter(item => Boolean(item.videoId));
        }
    }
    catch (err) {
        console.warn('youtube-sr search fallito, provo fallback Innertube Web...', err);
    }
    // Metodo 2: Fallback su Innertube Web
    if (formatted.length === 0) {
        try {
            if (!ytWeb) {
                ytWeb = await youtubei_js_1.Innertube.create({ client_type: youtubei_js_1.ClientType.WEB, cache: new youtubei_js_1.UniversalCache(false) });
            }
            const webRes = await ytWeb.search(cleanQuery, { type: 'video' });
            const vids = webRes.videos || webRes.results || [];
            if (Array.isArray(vids) && vids.length > 0) {
                formatted = vids.map((item) => ({
                    videoId: item.id || item.video_id || '',
                    title: item.title?.text || item.title || '',
                    artist: item.author?.name || item.channel?.name || 'Artista',
                    album: 'YouTube Music',
                    duration: item.duration?.seconds || 180,
                    thumbnailUrl: item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
                    views: 0,
                    uploadedAt: ''
                })).filter((item) => Boolean(item.videoId));
            }
        }
        catch (err) {
            console.warn('Innertube search fallito:', err);
        }
    }
    // Metodo 3: Fallback su brani salvati di default
    if (formatted.length === 0) {
        formatted = DEFAULT_HITS;
    }
    try {
        await redis_1.default.setex(cacheKey, 900, JSON.stringify(formatted)); // 15 mins cache
    }
    catch { }
    return formatted;
};
exports.search = search;
const getSearchSuggestions = async (query) => {
    if (!query || !query.trim())
        return [];
    try {
        const suggestions = await youtube_sr_1.default.getSuggestions(query.trim());
        return suggestions || [];
    }
    catch (error) {
        return [];
    }
};
exports.getSearchSuggestions = getSearchSuggestions;
const child_process_1 = require("child_process");
const resolveStreamUrlWithYtDlp = (videoId) => {
    return new Promise((resolve) => {
        const cmd = `python -m yt_dlp --quiet --no-warnings -g -f "140/bestaudio/ba" "https://www.youtube.com/watch?v=${videoId}"`;
        (0, child_process_1.exec)(cmd, { timeout: 15000 }, (err, stdout) => {
            if (err) {
                return resolve(null);
            }
            const lines = stdout.trim().split(/\r?\n/).filter(l => l.startsWith('http'));
            resolve(lines[0] || null);
        });
    });
};
const getStreamUrl = async (videoId) => {
    try {
        const cacheKey = `stream:${videoId}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        // Metodo 1: Risolutore diretto yt-dlp (supporta seek e range arbitrari)
        const directUrl = await resolveStreamUrlWithYtDlp(videoId);
        if (directUrl) {
            const result = {
                url: directUrl,
                format: directUrl.includes('mime=audio%2Fwebm') ? 'audio/webm' : 'audio/mp4',
                bitrate: 130000,
                duration: 240,
                expiresAt: Date.now() + 5 * 60 * 60 * 1000
            };
            await redis_1.default.setex(cacheKey, 14400, JSON.stringify(result)); // 4 ore di cache
            return result;
        }
        // Metodo 2: Fallback Innertube iOS
        if (!ytIos) {
            ytIos = await youtubei_js_1.Innertube.create({ client_type: youtubei_js_1.ClientType.IOS, cache: new youtubei_js_1.UniversalCache(false) });
        }
        if (!ytIos)
            return null;
        const info = await ytIos.getBasicInfo(videoId);
        const formats = info.streaming_data?.adaptive_formats || [];
        const audioFormats = formats.filter(f => f.mime_type?.startsWith('audio/'));
        if (audioFormats.length === 0)
            return null;
        audioFormats.sort((a, b) => (b.average_bitrate || 0) - (a.average_bitrate || 0));
        const bestFormat = audioFormats.find(f => Boolean(f.url)) || audioFormats[0];
        if (!bestFormat)
            return null;
        const resolvedUrl = bestFormat.url || (await bestFormat.decipher(ytIos.session.player));
        if (!resolvedUrl)
            return null;
        const result = {
            url: resolvedUrl,
            format: bestFormat.mime_type?.split(';')[0] || 'audio/mp4',
            bitrate: bestFormat.average_bitrate || bestFormat.bitrate || 128000,
            duration: Math.round((info.basic_info?.duration || 0)),
            expiresAt: Date.now() + 5 * 60 * 60 * 1000
        };
        await redis_1.default.setex(cacheKey, 14400, JSON.stringify(result));
        return result;
    }
    catch (error) {
        console.error('Stream URL error', error);
        return null;
    }
};
exports.getStreamUrl = getStreamUrl;
const getTrackInfo = async (videoId) => {
    try {
        const cacheKey = `track:${videoId}`;
        const cached = await redis_1.default.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const video = await youtube_sr_1.default.getVideo(`https://www.youtube.com/watch?v=${videoId}`).catch(() => null);
        if (video) {
            const result = {
                videoId: video.id,
                title: video.title,
                artist: video.channel?.name || 'Artista Sconosciuto',
                duration: Math.round((video.duration || 0) / 1000),
                thumbnailUrl: video.thumbnail?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                views: video.views,
                description: video.description
            };
            await redis_1.default.setex(cacheKey, 3600, JSON.stringify(result));
            return result;
        }
        if (!ytIos) {
            ytIos = await youtubei_js_1.Innertube.create({ client_type: youtubei_js_1.ClientType.IOS, cache: new youtubei_js_1.UniversalCache(false) });
        }
        if (ytIos) {
            const info = await ytIos.getBasicInfo(videoId);
            const result = {
                videoId,
                title: info.basic_info?.title || 'Brano',
                artist: info.basic_info?.author || 'Artista',
                duration: Math.round(info.basic_info?.duration || 0),
                thumbnailUrl: info.basic_info?.thumbnail?.[0]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                views: Number(info.basic_info?.view_count || 0),
                description: info.basic_info?.short_description || ''
            };
            await redis_1.default.setex(cacheKey, 3600, JSON.stringify(result));
            return result;
        }
        return null;
    }
    catch (error) {
        console.error('Track info error', error);
        return null;
    }
};
exports.getTrackInfo = getTrackInfo;
const getHome = async () => {
    try {
        const trending = await (0, exports.getTrending)();
        const italianHits = await (0, exports.search)('Classifiche Musica Italia Top 50');
        const globalHits = await (0, exports.search)('Top Hits Today 2026');
        return {
            sections: [
                {
                    title: '🔥 Tendenze del Momento',
                    items: trending.slice(0, 10)
                },
                {
                    title: '🇮🇹 Top Hits Italia',
                    items: italianHits.slice(0, 10)
                },
                {
                    title: '🌍 Global Top 50',
                    items: globalHits.slice(0, 10)
                }
            ]
        };
    }
    catch (error) {
        console.error('Home error', error);
        return { sections: [] };
    }
};
exports.getHome = getHome;
const getTrending = async () => {
    try {
        const cacheKey = 'trending:music';
        const cached = await redis_1.default.get(cacheKey);
        if (cached)
            return JSON.parse(cached);
        const results = await (0, exports.search)('Musica Tendenze Nuove Uscite 2026');
        await redis_1.default.setex(cacheKey, 1800, JSON.stringify(results));
        return results;
    }
    catch (error) {
        return DEFAULT_HITS;
    }
};
exports.getTrending = getTrending;
const getExplore = async () => {
    return {
        genres: [
            { id: 'pop', name: 'Pop', color: '#ec4899', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
            { id: 'hiphop', name: 'Hip-Hop & Trap', color: '#8b5cf6', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' },
            { id: 'rock', name: 'Rock', color: '#ef4444', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300' },
            { id: 'dance', name: 'Dance & EDM', color: '#06b6d4', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
            { id: 'indie', name: 'Indie & R&B', color: '#10b981', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300' },
            { id: 'latin', name: 'Latino & Reggaeton', color: '#f59e0b', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' }
        ]
    };
};
exports.getExplore = getExplore;
const getRadio = async (videoId) => {
    try {
        const track = await (0, exports.getTrackInfo)(videoId);
        const query = track ? `${track.artist} mix` : 'Top Music Mix';
        const similar = await (0, exports.search)(query);
        return similar.filter((i) => i.videoId !== videoId);
    }
    catch (error) {
        return [];
    }
};
exports.getRadio = getRadio;
const getAlbum = async (albumId) => {
    try {
        const playlist = await youtube_sr_1.default.getPlaylist(`https://www.youtube.com/playlist?list=${albumId}`);
        return {
            id: playlist.id,
            title: playlist.title,
            artist: playlist.channel?.name,
            thumbnailUrl: playlist.thumbnail?.url,
            tracks: playlist.videos?.map(v => ({
                videoId: v.id,
                title: v.title,
                duration: Math.round((v.duration || 0) / 1000),
                thumbnailUrl: v.thumbnail?.url
            }))
        };
    }
    catch (error) {
        return null;
    }
};
exports.getAlbum = getAlbum;
const getArtist = async (artistId) => {
    try {
        const results = await (0, exports.search)(artistId);
        return {
            id: artistId,
            name: artistId,
            tracks: results
        };
    }
    catch (error) {
        return null;
    }
};
exports.getArtist = getArtist;
// Inizializza client
(0, exports.initialize)();
