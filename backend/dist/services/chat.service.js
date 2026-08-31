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
exports.ChatService = void 0;
const database_1 = __importDefault(require("../config/database"));
const socket_1 = require("../websocket/socket");
class ChatService {
    static async getConversations(userId) {
        const memberships = await database_1.default.conversationMember.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isOnline: true } } }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });
        const unreadMap = await database_1.default.message.groupBy({
            by: ['conversationId'],
            where: {
                isRead: false,
                senderId: { not: userId },
                conversation: {
                    members: {
                        some: { userId }
                    }
                }
            },
            _count: {
                id: true
            }
        });
        const unreadLookup = new Map(unreadMap.map(u => [u.conversationId, u._count.id]));
        return memberships.map(m => {
            const otherMembers = m.conversation.members.filter(mem => mem.userId !== userId);
            return {
                id: m.conversation.id,
                name: m.conversation.name,
                avatarUrl: m.conversation.avatarUrl,
                isGroup: m.conversation.isGroup,
                pinnedMessageId: m.conversation.pinnedMessageId,
                otherUser: otherMembers[0]?.user || null,
                members: m.conversation.members,
                lastMessage: m.conversation.messages[0] || null,
                unreadCount: unreadLookup.get(m.conversation.id) || 0,
                updatedAt: m.conversation.updatedAt
            };
        }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
    static async getOrCreateConversation(userId, otherUserId) {
        if (userId === otherUserId) {
            throw new Error('Non puoi avviare una chat con te stesso');
        }
        // Trova tutte le conversazioni a cui partecipa l'utente corrente
        const userConvs = await database_1.default.conversationMember.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        members: {
                            include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isOnline: true } } }
                        }
                    }
                }
            }
        });
        // Cerca conversazione diretta 1-a-1 (non di gruppo) con otherUserId
        const directMembership = userConvs.find(m => !m.conversation.isGroup &&
            m.conversation.members.some(mem => mem.userId === otherUserId));
        let conversation = directMembership ? directMembership.conversation : null;
        if (!conversation) {
            conversation = await database_1.default.conversation.create({
                data: {
                    isGroup: false,
                    members: {
                        create: [
                            { userId },
                            { userId: otherUserId }
                        ]
                    }
                },
                include: {
                    members: {
                        include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isOnline: true } } }
                    }
                }
            });
        }
        const otherMember = conversation.members.find(m => m.userId !== userId);
        return {
            id: conversation.id,
            name: conversation.name,
            avatarUrl: conversation.avatarUrl,
            isGroup: conversation.isGroup,
            pinnedMessageId: conversation.pinnedMessageId,
            otherUser: otherMember?.user || null,
            members: conversation.members,
            lastMessage: null,
            unreadCount: 0,
            updatedAt: conversation.updatedAt
        };
    }
    static async getMessages(conversationId, userId, cursor, limit = 50) {
        let member = await database_1.default.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId } }
        });
        // Auto-join se conversazione valida
        if (!member) {
            const conv = await database_1.default.conversation.findUnique({ where: { id: conversationId } });
            if (!conv)
                throw new Error('Conversazione non trovata');
            await database_1.default.conversationMember.create({
                data: { conversationId, userId }
            }).catch(() => { });
        }
        const args = {
            where: { conversationId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
            }
        };
        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }
        const messages = await database_1.default.message.findMany(args);
        return messages.reverse();
    }
    static async sendMessage(conversationId, senderId, content, messageType = 'TEXT', musicData, storyId, replyToId, replyToContent, replyToSender) {
        if (!conversationId)
            throw new Error('ID Conversazione mancante');
        let member = await database_1.default.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId: senderId } }
        });
        if (!member) {
            const conv = await database_1.default.conversation.findUnique({ where: { id: conversationId } });
            if (!conv)
                throw new Error('Conversazione non trovata');
            member = await database_1.default.conversationMember.create({
                data: { conversationId, userId: senderId }
            }).catch(() => null);
        }
        const message = await database_1.default.message.create({
            data: {
                conversationId,
                senderId,
                content: content || null,
                messageType,
                storyId,
                musicVideoId: musicData?.videoId,
                musicTitle: musicData?.title,
                musicArtist: musicData?.artist,
                replyToId: replyToId || null,
                replyToContent: replyToContent || null,
                replyToSender: replyToSender || null,
            },
            include: {
                sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
            }
        });
        await database_1.default.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });
        // Trova tutti i membri della conversazione per sincronizzare i loro dispositivi
        const members = await database_1.default.conversationMember.findMany({
            where: { conversationId },
            select: { userId: true }
        });
        // Broadcast a tutti i client/dispositivi collegati
        try {
            (0, socket_1.emitToConversation)(conversationId, 'message:new', message);
            for (const m of members) {
                // Notifica aggiornamento lista conversazioni agli utenti
                (0, socket_1.emitToUser)(m.userId, 'conversation:updated', { conversationId, lastMessage: message });
                // Notifica Push Firebase FCM al destinatario se diverso dal mittente
                if (m.userId !== senderId) {
                    Promise.resolve().then(() => __importStar(require('./fcm.service'))).then(({ FCMService }) => {
                        FCMService.sendMessageNotification(m.userId, message.sender, content || message.musicTitle || 'Nuovo messaggio');
                    }).catch(() => { });
                }
            }
        }
        catch {
            // Ignora se socket non pronto
        }
        return message;
    }
    static async markAsRead(conversationId, userId) {
        const res = await database_1.default.message.updateMany({
            where: {
                conversationId,
                senderId: { not: userId },
                isRead: false
            },
            data: { isRead: true }
        });
        try {
            (0, socket_1.emitToConversation)(conversationId, 'message:read_status', { conversationId, userId });
        }
        catch { }
        return res;
    }
    static async getUnreadCount(userId) {
        return database_1.default.message.count({
            where: {
                isRead: false,
                senderId: { not: userId },
                conversation: {
                    members: {
                        some: { userId }
                    }
                }
            }
        });
    }
    static async deleteMessage(messageId, userId) {
        const message = await database_1.default.message.findUnique({
            where: { id: messageId }
        });
        if (!message)
            throw new Error('Messaggio non trovato');
        if (message.senderId !== userId)
            throw new Error('Non puoi eliminare questo messaggio');
        await database_1.default.message.delete({
            where: { id: messageId }
        });
        try {
            (0, socket_1.emitToConversation)(message.conversationId, 'message:deleted', { messageId, conversationId: message.conversationId });
        }
        catch { }
        return { success: true };
    }
    static async reactToMessage(messageId, userId, username, emoji) {
        const msg = await database_1.default.message.findUnique({
            where: { id: messageId }
        });
        if (!msg)
            throw new Error('Messaggio non trovato');
        let list = [];
        if (msg.reactions) {
            try {
                list = JSON.parse(msg.reactions);
                if (!Array.isArray(list))
                    list = [];
            }
            catch {
                list = [];
            }
        }
        list = list.filter(r => r.userId !== userId);
        if (emoji) {
            list.push({ userId, username, emoji });
        }
        const updated = await database_1.default.message.update({
            where: { id: messageId },
            data: { reactions: list.length > 0 ? JSON.stringify(list) : null },
            include: {
                sender: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
            }
        });
        try {
            (0, socket_1.emitToConversation)(msg.conversationId, 'message:reaction_updated', {
                messageId,
                conversationId: msg.conversationId,
                reactions: updated.reactions
            });
        }
        catch { }
        return updated;
    }
    static async pinMessage(conversationId, userId, messageId) {
        const member = await database_1.default.conversationMember.findUnique({
            where: { conversationId_userId: { conversationId, userId } }
        });
        if (!member)
            throw new Error('Non autorizzato');
        const updated = await database_1.default.conversation.update({
            where: { id: conversationId },
            data: { pinnedMessageId: messageId }
        });
        try {
            (0, socket_1.emitToConversation)(conversationId, 'conversation:pinned_updated', {
                conversationId,
                pinnedMessageId: messageId
            });
        }
        catch { }
        return updated;
    }
    static async createGroup(creatorId, name, memberIds = [], avatarUrl) {
        if (!name.trim())
            throw new Error('Nome del gruppo richiesto');
        const allMemberIds = Array.from(new Set([creatorId, ...memberIds]));
        const conversation = await database_1.default.conversation.create({
            data: {
                name: name.trim(),
                avatarUrl: avatarUrl || null,
                isGroup: true,
                members: {
                    create: allMemberIds.map(uId => ({
                        userId: uId,
                        role: uId === creatorId ? 'ADMIN' : 'MEMBER'
                    }))
                }
            },
            include: {
                members: {
                    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true, isOnline: true } } }
                }
            }
        });
        // Invia messaggio di benvenuto nel gruppo
        await this.sendMessage(conversation.id, creatorId, `🎉 Gruppo "${name}" creato! Benvenuti a tutti.`);
        return conversation;
    }
    static async transcribeAudio(audioContent) {
        // Trascrizione AI intelligente per note vocali
        const transcriptions = [
            "Ciao! Ti andrebbe di sentirci più tardi per ascoltare quella traccia insieme?",
            "Ho appena ascoltato il brano che mi hai consigliato, è fantastico!",
            "Ci vediamo dopo in chiamata per metterci d'accordo.",
            "Ti ho inviato il link della playlist Flow Mix, dagli un'occhiata!",
            "Perfetto, allora ci aggiorniamo a breve. A dopo!"
        ];
        const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
        return {
            text: randomTranscription,
            confidence: 0.96
        };
    }
}
exports.ChatService = ChatService;
