"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRateLimit = exports.authRateLimit = exports.rateLimit = void 0;
// Mappa in memory semplice (solo per dev).
// In produzione si dovrebbe usare Redis.
const hits = new Map();
const rateLimit = (config) => {
    return (req, res, next) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const now = Date.now();
        const record = hits.get(ip);
        if (!record || record.resetTime < now) {
            hits.set(ip, { count: 1, resetTime: now + config.windowMs });
            return next();
        }
        if (record.count >= config.max) {
            return res.status(429).json({ error: config.message });
        }
        record.count++;
        hits.set(ip, record);
        next();
    };
};
exports.rateLimit = rateLimit;
exports.authRateLimit = (0, exports.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 10,
    message: 'Troppi tentativi, riprova più tardi',
});
exports.apiRateLimit = (0, exports.rateLimit)({
    windowMs: 60 * 1000, // 1 minuto
    max: 100,
    message: 'Troppe richieste, rallenta un po\'',
});
