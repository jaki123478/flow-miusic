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
exports.broadcastEvent = exports.emitToConversation = exports.emitToUser = exports.setupSocketIO = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const chat_service_1 = require("../services/chat.service");
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET || 'access-secret';
let globalIO = null;
const setupSocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });
    globalIO = io;
    // Middleware autenticazione
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next();
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
            socket.data.userId = decoded.userId || decoded.id;
            next();
        }
        catch {
            next();
        }
    });
    io.on('connection', async (socket) => {
        const userId = socket.data.userId;
        if (userId) {
            console.log(`User connected (Multi-Device Sync): ${userId} (Socket: ${socket.id})`);
            // Imposta utente online
            await database_1.default.user.update({
                where: { id: userId },
                data: { isOnline: true }
            }).catch(() => { });
            io.emit('user:online', { userId });
            // Join room specifica per questo utente (sincronizza tutti i dispositivi del medesimo account: PC, iPhone, Android)
            socket.join(`user:${userId}`);
            // Join room di tutte le conversazioni dell'utente
            try {
                const participations = await database_1.default.conversationMember.findMany({
                    where: { userId },
                    select: { conversationId: true }
                });
                participations.forEach(p => {
                    socket.join(`conv:${p.conversationId}`);
                });
            }
            catch (err) {
                console.error('Errore join room conversazioni:', err);
            }
        }
        // Autenticazione Dinamica Immediata da Client
        socket.on('auth:authenticate', async (data) => {
            const token = data?.token;
            if (!token)
                return;
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_ACCESS_SECRET);
                const authUserId = decoded.userId || decoded.id;
                if (authUserId) {
                    socket.data.userId = authUserId;
                    socket.join(`user:${authUserId}`);
                    console.log(`⚡ Socket ${socket.id} autenticato con successo per utente ${authUserId}`);
                    await database_1.default.user.update({
                        where: { id: authUserId },
                        data: { isOnline: true }
                    }).catch(() => { });
                    io.emit('user:online', { userId: authUserId });
                    const participations = await database_1.default.conversationMember.findMany({
                        where: { userId: authUserId },
                        select: { conversationId: true }
                    });
                    participations.forEach(p => {
                        socket.join(`conv:${p.conversationId}`);
                    });
                }
            }
            catch (err) {
                console.warn('Errore auth dinamica socket:', err);
            }
        });
        // Join esplicito di una stanza conversazione
        socket.on('join:conversation', ({ conversationId }) => {
            if (conversationId) {
                socket.join(`conv:${conversationId}`);
            }
        });
        // Gestione invio messaggio via WebSocket
        socket.on('message:send', async (data, callback) => {
            const currentUserId = socket.data.userId || userId;
            if (!currentUserId) {
                if (typeof callback === 'function')
                    callback({ success: false, error: 'Non autorizzato' });
                return;
            }
            try {
                const { conversationId, content, messageType, music, storyId } = data;
                const message = await chat_service_1.ChatService.sendMessage(conversationId, currentUserId, content, messageType, music, storyId);
                if (typeof callback === 'function') {
                    callback({ success: true, data: message });
                }
            }
            catch (err) {
                console.error('Errore invio messaggio websocket:', err);
                if (typeof callback === 'function') {
                    callback({ success: false, error: err.message || 'Errore invio messaggio' });
                }
                else {
                    socket.emit('error', { message: err.message || 'Errore invio messaggio' });
                }
            }
        });
        socket.on('message:read', async (data) => {
            if (!userId)
                return;
            try {
                const { conversationId } = data;
                await chat_service_1.ChatService.markAsRead(conversationId, userId);
                socket.to(`conv:${conversationId}`).emit('message:read_status', { conversationId, userId });
            }
            catch (err) {
                console.error(err);
            }
        });
        socket.on('chat:typing', (data) => {
            if (!userId)
                return;
            const { conversationId, isTyping } = data;
            socket.to(`conv:${conversationId}`).emit('chat:typing_status', { conversationId, userId, isTyping });
        });
        socket.on('message:reaction', async (data) => {
            if (!userId)
                return;
            try {
                const { messageId, emoji, conversationId } = data;
                const userRec = await database_1.default.user.findUnique({ where: { id: userId }, select: { username: true } });
                const username = userRec?.username || 'Utente';
                const updatedMsg = await chat_service_1.ChatService.reactToMessage(messageId, userId, username, emoji);
                io.to(`conv:${conversationId}`).emit('message:reaction_status', {
                    messageId,
                    conversationId,
                    reactions: updatedMsg.reactions
                });
            }
            catch (err) {
                console.error(err);
            }
        });
        // Gestione Chiamate Real-Time (Squilli & Notifiche Multi-Dispositivo)
        socket.on('call:start', async (data) => {
            const currentUserId = socket.data.userId || userId;
            const { recipientId, callType, caller } = data;
            if (recipientId) {
                console.log(`📞 Inoltro chiamata da ${currentUserId} a ${recipientId} (${callType})`);
                io.to(`user:${recipientId}`).emit('call:incoming', {
                    caller: caller || { id: currentUserId },
                    callType: callType || 'video',
                    timestamp: Date.now()
                });
                // Invio notifica push nativa OS via Firebase FCM
                try {
                    const { FCMService } = await Promise.resolve().then(() => __importStar(require('../services/fcm.service')));
                    await FCMService.sendCallNotification(recipientId, caller || { id: currentUserId }, callType || 'video');
                }
                catch (e) {
                    console.warn('Errore invio push FCM per chiamata:', e);
                }
            }
        });
        socket.on('call:accept', (data) => {
            const currentUserId = socket.data.userId || userId;
            const { callerId } = data;
            if (callerId) {
                io.to(`user:${callerId}`).emit('call:accepted', data);
            }
            // Ferma lo squillo sugli altri dispositivi dello stesso utente (es. se risponde da tablet, il telefono smette di squillare)
            if (currentUserId) {
                socket.to(`user:${currentUserId}`).emit('call:accepted_elsewhere', data);
            }
        });
        socket.on('call:decline', (data) => {
            const currentUserId = socket.data.userId || userId;
            const { callerId } = data;
            if (callerId) {
                io.to(`user:${callerId}`).emit('call:declined', data);
            }
            if (currentUserId) {
                io.to(`user:${currentUserId}`).emit('call:dismissed', data);
            }
        });
        socket.on('call:end', (data) => {
            const currentUserId = socket.data.userId || userId;
            const { targetUserId } = data;
            if (targetUserId) {
                io.to(`user:${targetUserId}`).emit('call:ended', data);
            }
            if (currentUserId) {
                io.to(`user:${currentUserId}`).emit('call:ended', data);
            }
        });
        // ==========================================
        // Real-Time Collaborative Jam Room Sync
        // ==========================================
        socket.on('jam:join_room', (data) => {
            const roomId = data?.roomId || 'global_jam';
            socket.join(`jam:${roomId}`);
            let roomState = global.jamRooms?.get(roomId);
            if (!roomState) {
                roomState = {
                    currentTrack: null,
                    isPlaying: false,
                    currentTime: 0,
                    queue: []
                };
                if (!global.jamRooms)
                    global.jamRooms = new Map();
                global.jamRooms.set(roomId, roomState);
            }
            socket.emit('jam:state_sync', roomState);
        });
        socket.on('jam:queue_add', (data) => {
            const currentUserId = socket.data.userId || userId || 'guest';
            const roomId = data?.roomId || 'global_jam';
            const track = data?.track;
            if (!track)
                return;
            let roomState = global.jamRooms?.get(roomId);
            if (!roomState) {
                roomState = { currentTrack: track, isPlaying: true, currentTime: 0, queue: [] };
                if (!global.jamRooms)
                    global.jamRooms = new Map();
                global.jamRooms.set(roomId, roomState);
            }
            else {
                const newItem = {
                    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                    track,
                    addedBy: data?.username || 'Utente',
                    votes: 1,
                    voters: [currentUserId]
                };
                roomState.queue.push(newItem);
            }
            io.to(`jam:${roomId}`).emit('jam:state_sync', roomState);
        });
        socket.on('jam:vote_track', (data) => {
            const currentUserId = socket.data.userId || userId || 'guest';
            const roomId = data?.roomId || 'global_jam';
            const queueItemId = data?.queueItemId;
            const roomState = global.jamRooms?.get(roomId);
            if (roomState && queueItemId) {
                const item = roomState.queue.find((q) => q.id === queueItemId);
                if (item) {
                    if (item.voters.includes(currentUserId)) {
                        item.voters = item.voters.filter((v) => v !== currentUserId);
                        item.votes = Math.max(0, item.votes - 1);
                    }
                    else {
                        item.voters.push(currentUserId);
                        item.votes += 1;
                    }
                    // Riordina la coda in base ai voti
                    roomState.queue.sort((a, b) => b.votes - a.votes);
                    io.to(`jam:${roomId}`).emit('jam:state_sync', roomState);
                }
            }
        });
        socket.on('jam:play_next', (data) => {
            const roomId = data?.roomId || 'global_jam';
            const roomState = global.jamRooms?.get(roomId);
            if (roomState && roomState.queue.length > 0) {
                const next = roomState.queue.shift();
                roomState.currentTrack = next.track;
                roomState.isPlaying = true;
                roomState.currentTime = 0;
                io.to(`jam:${roomId}`).emit('jam:state_sync', roomState);
            }
        });
        socket.on('jam:sync_control', (data) => {
            const roomId = data?.roomId || 'global_jam';
            const roomState = global.jamRooms?.get(roomId);
            if (roomState) {
                if (data.isPlaying !== undefined)
                    roomState.isPlaying = data.isPlaying;
                if (data.currentTime !== undefined)
                    roomState.currentTime = data.currentTime;
                if (data.currentTrack !== undefined)
                    roomState.currentTrack = data.currentTrack;
                socket.to(`jam:${roomId}`).emit('jam:state_sync', roomState);
            }
        });
        socket.on('disconnect', async () => {
            if (userId) {
                console.log(`User disconnected: ${userId}`);
                await database_1.default.user.update({
                    where: { id: userId },
                    data: { isOnline: false, lastSeen: new Date() }
                }).catch(() => { });
                io.emit('user:offline', { userId });
            }
        });
    });
};
exports.setupSocketIO = setupSocketIO;
const emitToUser = (userId, event, data) => {
    if (globalIO) {
        globalIO.to(`user:${userId}`).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
const emitToConversation = (conversationId, event, data) => {
    if (globalIO) {
        globalIO.to(`conv:${conversationId}`).emit(event, data);
    }
};
exports.emitToConversation = emitToConversation;
const broadcastEvent = (event, data) => {
    if (globalIO) {
        globalIO.emit(event, data);
    }
};
exports.broadcastEvent = broadcastEvent;
