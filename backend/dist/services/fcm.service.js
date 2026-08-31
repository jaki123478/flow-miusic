"use strict";
// Servizio Firebase Cloud Messaging (FCM) per Notifiche Push Native Android & iOS
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FCMService = void 0;
const firebase_1 = require("../config/firebase");
const redis_1 = __importDefault(require("../config/redis"));
// Mappa in-memory di fallback per i token FCM degli utenti
const memoryTokens = new Map();
class FCMService {
    /**
     * Salva il token FCM per un utente
     */
    static async saveToken(userId, token) {
        if (!userId || !token)
            return;
        // Salva in memoria
        if (!memoryTokens.has(userId)) {
            memoryTokens.set(userId, new Set());
        }
        memoryTokens.get(userId).add(token);
        // Salva in Redis se disponibile (TTL 60 giorni)
        try {
            if (redis_1.default && redis_1.default.status === 'ready') {
                await redis_1.default.sadd(`fcm:${userId}`, token);
                await redis_1.default.expire(`fcm:${userId}`, 60 * 24 * 60 * 60);
            }
        }
        catch (e) {
            console.warn('Errore salvataggio token FCM in Redis:', e);
        }
        console.log(`📱 Token FCM registrato per utente ${userId}`);
    }
    /**
     * Recupera tutti i token FCM registrati per un utente
     */
    static async getUserTokens(userId) {
        const tokens = new Set();
        // Da memoria
        const mem = memoryTokens.get(userId);
        if (mem)
            mem.forEach(t => tokens.add(t));
        // Da Redis
        try {
            if (redis_1.default && redis_1.default.status === 'ready') {
                const redisTokens = await redis_1.default.smembers(`fcm:${userId}`);
                redisTokens.forEach((t) => tokens.add(t));
            }
        }
        catch (e) {
            console.warn('Errore lettura token FCM da Redis:', e);
        }
        return Array.from(tokens);
    }
    /**
     * Invia una Notifica Push a tutti i dispositivi di un utente
     */
    static async sendToUser(userId, notification, data) {
        if (!(0, firebase_1.isFCMReady)()) {
            return false;
        }
        const tokens = await this.getUserTokens(userId);
        if (tokens.length === 0) {
            return false;
        }
        try {
            const message = {
                tokens,
                notification: {
                    title: notification.title,
                    body: notification.body,
                    imageUrl: notification.icon || 'https://uniprotkb-champagne-situated-norm.trycloudflare.com/icon-192x192.png'
                },
                data: {
                    ...data,
                    click_action: data?.url || '/'
                },
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        vibrateTimingsMillis: [200, 100, 200, 100, 300],
                        priority: 'max',
                        channelId: 'socialflow_alerts'
                    }
                },
                webpush: {
                    headers: {
                        Urgency: 'high'
                    },
                    notification: {
                        icon: '/icon-192x192.png',
                        badge: '/icon-192x192.png',
                        vibrate: [300, 100, 300]
                    }
                }
            };
            const messaging = (0, firebase_1.getMessaging)();
            const response = await messaging.sendEachForMulticast(message);
            console.log(`🔔 FCM inviato a ${userId}: ${response.successCount} successi, ${response.failureCount} errori`);
            // Rimuovi token non più validi
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
                    const badToken = tokens[idx];
                    memoryTokens.get(userId)?.delete(badToken);
                    if (redis_1.default && redis_1.default.status === 'ready')
                        redis_1.default.srem(`fcm:${userId}`, badToken).catch(() => { });
                }
            });
            return response.successCount > 0;
        }
        catch (err) {
            console.warn('Errore invio notifica FCM:', err);
            return false;
        }
    }
    /**
     * Notifica di Chiamata in Arrivo ad Alta Priorità
     */
    static async sendCallNotification(recipientId, caller, callType) {
        const callerName = caller?.displayName || caller?.username || 'Un utente';
        return this.sendToUser(recipientId, {
            title: `📞 Chiamata da ${callerName}`,
            body: callType === 'video' ? 'Videochiamata HD in arrivo...' : 'Chiamata vocale in arrivo...',
            icon: caller?.avatarUrl || '/icon-192x192.png'
        }, {
            type: 'CALL',
            callType,
            callerId: caller?.id || '',
            url: '/messages'
        });
    }
    /**
     * Notifica di Nuovo Messaggio in Chat
     */
    static async sendMessageNotification(recipientId, sender, content) {
        const senderName = sender?.displayName || sender?.username || 'Nuovo messaggio';
        const preview = content.startsWith('http') ? '📷 [Foto / File Allegato]' : content.substring(0, 80);
        return this.sendToUser(recipientId, {
            title: `💬 ${senderName}`,
            body: preview,
            icon: sender?.avatarUrl || '/icon-192x192.png'
        }, {
            type: 'CHAT_MESSAGE',
            senderId: sender?.id || '',
            url: '/messages'
        });
    }
}
exports.FCMService = FCMService;
