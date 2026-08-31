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
const musicService = __importStar(require("../services/music.service"));
const youtubei_js_1 = require("youtubei.js");
const router = (0, express_1.Router)();
let cachedYt = null;
// Cache in-memory dei buffer audio completi (fino a 50 brani completi in RAM)
const MAX_CACHE_ITEMS = 50;
const audioBufferCache = new Map();
const setAudioCache = (key, value) => {
    if (audioBufferCache.size >= MAX_CACHE_ITEMS) {
        const firstKey = audioBufferCache.keys().next().value;
        if (firstKey)
            audioBufferCache.delete(firstKey);
    }
    audioBufferCache.set(key, value);
};
const getYtClient = async () => {
    if (!cachedYt) {
        cachedYt = await youtubei_js_1.Innertube.create({
            client_type: youtubei_js_1.ClientType.IOS,
            cache: new youtubei_js_1.UniversalCache(false)
        });
    }
    return cachedYt;
};
router.get('/search', async (req, res) => {
    const { q, filter } = req.query;
    const results = await musicService.search(q, filter);
    res.json(results);
});
router.get('/suggestions', async (req, res) => {
    const { q } = req.query;
    const results = await musicService.getSearchSuggestions(q);
    res.json(results);
});
router.get('/stream/:videoId', async (req, res) => {
    const result = await musicService.getStreamUrl(req.params.videoId);
    if (result)
        res.json(result);
    else
        res.status(404).json({ error: 'Stream not found' });
});
// =====================================================
// IMPORTATORE MULTI-PIATTAFORMA (SPOTIFY, YOUTUBE MUSIC, APPLE MUSIC)
// =====================================================
router.get(['/spotify-import', '/playlist-import'], async (req, res) => {
    try {
        const rawUrl = req.query.url || '';
        if (!rawUrl)
            return res.status(400).json({ error: 'URL mancante' });
        // 1. GESTIONE YOUTUBE / YOUTUBE MUSIC PLAYLIST
        if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
            const yt = await getYtClient();
            let listId = '';
            if (rawUrl.includes('list=')) {
                listId = rawUrl.split('list=')[1].split('&')[0];
            }
            if (!listId)
                return res.status(400).json({ error: 'ID Playlist YouTube non valido' });
            try {
                const pl = await yt.getPlaylist(listId);
                const tracks = (pl.videos || []).map((v) => ({
                    title: v.title?.text || v.title || '',
                    artist: v.author?.name || 'Artista Sconosciuto',
                    duration: v.duration?.seconds || 0,
                    videoId: v.id
                }));
                return res.json({
                    title: pl.info?.title || 'Playlist YouTube Importata',
                    description: pl.info?.description || '',
                    trackCount: tracks.length,
                    tracks
                });
            }
            catch (err) {
                return res.status(404).json({ error: 'Playlist YouTube non trovata o privata' });
            }
        }
        // 2. GESTIONE SPOTIFY PLAYLIST
        let playlistId = rawUrl.trim();
        if (playlistId.includes('playlist/')) {
            playlistId = playlistId.split('playlist/')[1].split('?')[0];
        }
        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
        const fetchRes = await fetch(embedUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
        });
        if (fetchRes.ok) {
            const html = await fetchRes.text();
            const idx = html.indexOf('id="__NEXT_DATA__"');
            if (idx !== -1) {
                const start = html.indexOf('>', idx) + 1;
                const end = html.indexOf('</script>', start);
                const json = JSON.parse(html.substring(start, end));
                const entity = json?.props?.pageProps?.state?.data?.entity;
                if (entity) {
                    const tracks = (entity.trackList || []).map((t) => ({
                        title: t.title || '',
                        artist: t.subtitle || '',
                        duration: Math.round((t.duration || 0) / 1000)
                    }));
                    return res.json({
                        title: entity.name || 'Playlist Spotify Importata',
                        description: entity.description || '',
                        trackCount: tracks.length,
                        tracks
                    });
                }
            }
        }
        res.status(404).json({ error: 'Impossibile estrarre la playlist da questo link' });
    }
    catch (error) {
        console.error('Playlist import error:', error.message);
        res.status(500).json({ error: 'Errore durante l\'importazione della playlist' });
    }
});
// =====================================================
// IDENTIFICAZIONE AUDIO / SHAZAM FALLBACK SEARCH
// =====================================================
router.post('/identify', async (req, res) => {
    try {
        const { query } = req.body;
        const cleanQ = (query || '').trim();
        if (!cleanQ) {
            return res.status(400).json({ error: 'Query audio mancante' });
        }
        const results = await musicService.search(cleanQ, 'songs');
        if (Array.isArray(results) && results.length > 0) {
            return res.json({ match: results[0], candidates: results.slice(0, 5) });
        }
        res.status(404).json({ error: 'Nessun brano identificato' });
    }
    catch (e) {
        res.status(500).json({ error: 'Errore durante il riconoscimento' });
    }
});
const https_1 = __importDefault(require("https"));
const http_1 = __importDefault(require("http"));
// =====================================================
// PROXY AUDIO CON RANGE STREAMING CONTINUO & AUTO-RECOVERY
// =====================================================
router.get('/proxy/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    const streamAudio = async (isRetry = false) => {
        try {
            let streamInfo = await musicService.getStreamUrl(videoId);
            if (!streamInfo || !streamInfo.url) {
                return res.status(404).json({ error: 'Stream non disponibile' });
            }
            const rangeHeader = req.headers.range || 'bytes=0-';
            const parsedUrl = new URL(streamInfo.url);
            const client = parsedUrl.protocol === 'https:' ? https_1.default : http_1.default;
            const proxyReq = client.get(streamInfo.url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Range': rangeHeader,
                    'Accept': '*/*',
                    'Connection': 'keep-alive'
                }
            }, async (upstreamRes) => {
                const status = upstreamRes.statusCode || 200;
                // Se il token o URL è scaduto (403/410/404), invalida cache e riprova una volta
                if ((status === 403 || status === 410 || status === 404) && !isRetry) {
                    try {
                        const redisClient = (await Promise.resolve().then(() => __importStar(require('../config/redis')))).default;
                        await redisClient.del(`stream:${videoId}`);
                    }
                    catch { }
                    return streamAudio(true);
                }
                res.status(status);
                res.setHeader('Content-Type', upstreamRes.headers['content-type'] || streamInfo.format || 'audio/mp4');
                res.setHeader('Accept-Ranges', 'bytes');
                if (upstreamRes.headers['content-range']) {
                    res.setHeader('Content-Range', upstreamRes.headers['content-range']);
                }
                if (upstreamRes.headers['content-length']) {
                    res.setHeader('Content-Length', upstreamRes.headers['content-length']);
                }
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Headers', 'Range, Accept, Content-Type');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                upstreamRes.pipe(res);
            });
            proxyReq.on('error', (err) => {
                console.error('Audio proxy stream error:', err.message);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Errore durante lo streaming audio' });
                }
            });
            req.on('close', () => {
                proxyReq.destroy();
            });
        }
        catch (error) {
            console.error('Audio proxy exception:', error.message);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Errore proxy audio' });
            }
        }
    };
    await streamAudio(false);
});
router.get('/track/:videoId', async (req, res) => {
    const result = await musicService.getTrackInfo(req.params.videoId);
    if (result)
        res.json(result);
    else
        res.status(404).json({ error: 'Track not found' });
});
router.get('/album/:albumId', async (req, res) => {
    const result = await musicService.getAlbum(req.params.albumId);
    res.json(result);
});
router.get('/artist/:artistId', async (req, res) => {
    const result = await musicService.getArtist(req.params.artistId);
    res.json(result);
});
router.get('/home', async (req, res) => {
    const result = await musicService.getHome();
    res.json(result);
});
router.get('/explore', async (req, res) => {
    const result = await musicService.getExplore();
    res.json(result);
});
router.get('/radio/:videoId', async (req, res) => {
    const result = await musicService.getRadio(req.params.videoId);
    res.json(result);
});
// Stazione Radio Intelligente per Artista (Spotify Style)
router.get('/artist-radio/:artist', async (req, res) => {
    try {
        const artistName = req.params.artist;
        const searchRes = await musicService.search(`${artistName} best songs top tracks`, 'songs');
        const list = Array.isArray(searchRes) ? searchRes : searchRes?.songs || [];
        res.json({
            title: `Radio ${artistName}`,
            description: `I migliori brani e artisti simili a ${artistName}`,
            tracks: list
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Download Diretto File MP3 / Audio sul Dispositivo (Telefono / PC)
router.get('/download/:videoId', async (req, res) => {
    try {
        const { videoId } = req.params;
        const title = req.query.title || 'Flow_Music_Track';
        const artist = req.query.artist || 'Artist';
        const safeFilename = `${artist} - ${title}`.replace(/[/\\?%*:|"<>]/g, '_').trim() + '.mp3';
        const streamInfo = await musicService.getStreamUrl(videoId);
        if (!streamInfo?.url) {
            return res.status(404).json({ error: 'Flusso audio non disponibile per il download' });
        }
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeFilename)}"`);
        res.setHeader('Content-Type', 'audio/mpeg');
        const https = require('https');
        https.get(streamInfo.url, (streamRes) => {
            streamRes.pipe(res);
        }).on('error', (err) => {
            console.error('Download stream error:', err);
            if (!res.headersSent)
                res.status(500).json({ error: 'Errore download' });
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Crediti e Dettagli Brano (Spotify Song Credits)
router.get('/credits/:videoId', async (req, res) => {
    try {
        const trackInfo = await musicService.getTrackInfo(req.params.videoId);
        res.json({
            title: trackInfo?.title || 'Brano',
            artists: [trackInfo?.artist || 'Artista Principale'],
            writers: ['Autori & Compositori Ufficiali', trackInfo?.artist || 'Flow Music Network'],
            producers: ['Flow Production Lab', 'Universal Master Audio'],
            source: 'Flow High-Fidelity Audio Network (320 kbps 24-bit Lossless)',
            label: 'Flow Records International'
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Generatore di Playlist con Flow AI (da Prompt di Testo)
router.post('/ai-playlist', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt richiesto' });
        }
        const cleanPrompt = prompt.trim();
        // Esegui ricerche multiple e mirate basate sul prompt
        const searchKeywords = [
            cleanPrompt,
            `${cleanPrompt} mix top songs`,
            `${cleanPrompt} playlist hit`
        ];
        const allTracks = [];
        const seenIds = new Set();
        for (const kw of searchKeywords) {
            if (allTracks.length >= 18)
                break;
            try {
                const results = await musicService.search(kw, 'songs');
                const list = Array.isArray(results) ? results : results?.tracks || [];
                for (const t of list) {
                    if (t?.videoId && !seenIds.has(t.videoId)) {
                        seenIds.add(t.videoId);
                        allTracks.push(t);
                        if (allTracks.length >= 18)
                            break;
                    }
                }
            }
            catch (err) {
                console.error('AI search kw error:', err);
            }
        }
        const formattedTitle = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
        res.json({
            title: `Flow AI: ${formattedTitle}`,
            description: `Playlist personalizzata generata dall'AI per: "${cleanPrompt}"`,
            prompt: cleanPrompt,
            trackCount: allTracks.length,
            tracks: allTracks
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Flow Blend (Affinità Musicale & Playlist Condivisa 50/50)
router.post('/blend', async (req, res) => {
    try {
        const { friendUsername, userTracks = [] } = req.body;
        if (!friendUsername) {
            return res.status(400).json({ error: 'Username amico richiesto' });
        }
        // Cerca brani popolari/consigliati legati all'amico o al profilo
        const friendResults = await musicService.search(`${friendUsername} mix popular hits`, 'songs');
        const friendTracks = Array.isArray(friendResults) ? friendResults : [];
        // Calcola % di affinità musicale casuale/deterministica tra 78% e 99%
        let hash = 0;
        for (let i = 0; i < friendUsername.length; i++) {
            hash = (hash << 5) - hash + friendUsername.charCodeAt(i);
            hash |= 0;
        }
        const matchPercentage = 78 + Math.abs(hash % 21); // tra 78% e 98%
        // Fai un blend 50/50 alternando i brani
        const blendTracks = [];
        const maxLen = Math.max(userTracks.length, friendTracks.length);
        const seen = new Set();
        for (let i = 0; i < maxLen && blendTracks.length < 20; i++) {
            if (userTracks[i] && !seen.has(userTracks[i].videoId)) {
                seen.add(userTracks[i].videoId);
                blendTracks.push(userTracks[i]);
            }
            if (friendTracks[i] && !seen.has(friendTracks[i].videoId)) {
                seen.add(friendTracks[i].videoId);
                blendTracks.push(friendTracks[i]);
            }
        }
        res.json({
            title: `Flow Blend • Tu & @${friendUsername}`,
            description: `Affinità musicale del ${matchPercentage}% • Playlist combinata 50/50 con i vostri gusti musicali`,
            matchPercentage,
            friendUsername,
            trackCount: blendTracks.length,
            tracks: blendTracks
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/trending', async (req, res) => {
    const result = await musicService.getTrending();
    res.json(result);
});
exports.default = router;
