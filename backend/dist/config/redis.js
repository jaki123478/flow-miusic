"use strict";
// Cache in-memory che sostituisce Redis (zero dipendenze esterne)
// Funziona identicamente per development senza bisogno di installare Redis
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJSON = getJSON;
exports.setJSON = setJSON;
class MemoryCache {
    status = 'ready';
    store = new Map();
    sets = new Map();
    cleanupInterval;
    constructor() {
        // Pulizia automatica ogni 60 secondi
        this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ...args) {
        let expiresAt = null;
        // Supporta: set(key, value, 'EX', seconds) oppure set(key, value)
        if (args.length >= 2 && (args[0] === 'EX' || args[0] === 'ex')) {
            expiresAt = Date.now() + args[1] * 1000;
        }
        this.store.set(key, { value, expiresAt });
        return 'OK';
    }
    async setex(key, seconds, value) {
        const expiresAt = Date.now() + seconds * 1000;
        this.store.set(key, { value, expiresAt });
        return 'OK';
    }
    async del(key) {
        const sDel = this.sets.delete(key);
        const mDel = this.store.delete(key);
        return sDel || mDel ? 1 : 0;
    }
    async expire(key, seconds) {
        const entry = this.store.get(key);
        if (entry) {
            entry.expiresAt = Date.now() + seconds * 1000;
            return 1;
        }
        return 0;
    }
    async sadd(key, ...members) {
        let s = this.sets.get(key);
        if (!s) {
            s = new Set();
            this.sets.set(key, s);
        }
        let added = 0;
        for (const m of members) {
            if (!s.has(m)) {
                s.add(m);
                added++;
            }
        }
        return added;
    }
    async smembers(key) {
        const s = this.sets.get(key);
        return s ? Array.from(s) : [];
    }
    async srem(key, ...members) {
        const s = this.sets.get(key);
        if (!s)
            return 0;
        let removed = 0;
        for (const m of members) {
            if (s.delete(m))
                removed++;
        }
        return removed;
    }
    async exists(key) {
        const entry = this.store.get(key);
        if (entry) {
            if (entry.expiresAt && Date.now() > entry.expiresAt) {
                this.store.delete(key);
                return 0;
            }
            return 1;
        }
        return this.sets.has(key) ? 1 : 0;
    }
    async keys(pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        const result = [];
        for (const key of this.store.keys()) {
            if (regex.test(key))
                result.push(key);
        }
        for (const key of this.sets.keys()) {
            if (regex.test(key) && !result.includes(key))
                result.push(key);
        }
        return result;
    }
    async flushall() {
        this.store.clear();
        this.sets.clear();
        return 'OK';
    }
    cleanup() {
        const now = Date.now();
        for (const [key, entry] of this.store) {
            if (entry.expiresAt && now > entry.expiresAt) {
                this.store.delete(key);
            }
        }
    }
    disconnect() {
        clearInterval(this.cleanupInterval);
    }
}
// Singleton - stessa interfaccia di ioredis per compatibilità
const redis = new MemoryCache();
console.log('✅ Cache in-memory inizializzata (sostituzione Redis)');
// Helper per cache JSON
async function getJSON(key) {
    const data = await redis.get(key);
    if (!data)
        return null;
    try {
        return JSON.parse(data);
    }
    catch {
        return null;
    }
}
async function setJSON(key, value, ttlSeconds) {
    const json = JSON.stringify(value);
    if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, json);
    }
    else {
        await redis.set(key, json);
    }
}
exports.default = redis;
