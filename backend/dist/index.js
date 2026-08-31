"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Carica variabili d'ambiente
dotenv_1.default.config();
const rateLimit_1 = require("./middleware/rateLimit");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const music_routes_1 = __importDefault(require("./routes/music.routes"));
const lyrics_routes_1 = __importDefault(require("./routes/lyrics.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const stories_routes_1 = __importDefault(require("./routes/stories.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const playlist_routes_1 = __importDefault(require("./routes/playlist.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const flow_routes_1 = __importDefault(require("./routes/flow.routes"));
const highlight_routes_1 = __importDefault(require("./routes/highlight.routes"));
const socket_1 = require("./websocket/socket");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
app.use(rateLimit_1.apiRateLimit);
// Serve static files (uploads)
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
const fs_1 = __importDefault(require("fs"));
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Download APK Ufficiale Flow per Android
app.get('/api/download/apk', (_req, res) => {
    const apkPath = path_1.default.join(process.cwd(), '..', 'Flow-v1.0.apk');
    if (fs_1.default.existsSync(apkPath)) {
        res.download(apkPath, 'Flow-v1.0.apk');
    }
    else {
        res.status(404).json({ error: 'APK in fase di generazione' });
    }
});
// Monta tutte le route API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/music', music_routes_1.default);
app.use('/api/lyrics', lyrics_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/stories', stories_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/playlist', playlist_routes_1.default);
app.use('/api/notifications', notifications_routes_1.default);
app.use('/api/flow', flow_routes_1.default);
app.use('/api/highlights', highlight_routes_1.default);
// Inizializza WebSocket (Socket.IO)
(0, socket_1.setupSocketIO)(server);
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Errore interno del server',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
const PORT = process.env.PORT || 3001;
const stories_service_1 = require("./services/stories.service");
server.listen(PORT, () => {
    console.log(`🚀 Server SocialFlow in ascolto sulla porta ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`💬 WebSocket: ws://localhost:${PORT}`);
    // Esegui pulizia automatica storie scadute (oltre 24h) all'avvio e ogni 5 minuti
    (0, stories_service_1.cleanupExpiredStories)();
    setInterval(stories_service_1.cleanupExpiredStories, 5 * 60 * 1000);
});
// Graceful shutdown
const gracefulShutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
