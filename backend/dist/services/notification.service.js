"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = __importDefault(require("../config/database"));
class NotificationService {
    static async createNotification(userId, fromUserId, type, postId, storyId, content) {
        // Non notificare se stessi
        if (userId === fromUserId)
            return null;
        const notification = await database_1.default.notification.create({
            data: {
                userId,
                fromUserId,
                type,
                postId,
                storyId,
                content,
            },
            include: {
                fromUser: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
            }
        });
        return notification;
    }
    static async getNotifications(userId, cursor, limit = 20) {
        const args = {
            where: { userId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                fromUser: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
            }
        };
        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }
        return database_1.default.notification.findMany(args);
    }
    static async markAsRead(notificationId, userId) {
        return database_1.default.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true }
        });
    }
    static async markAllAsRead(userId) {
        return database_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }
    static async getUnreadCount(userId) {
        return database_1.default.notification.count({
            where: { userId, isRead: false }
        });
    }
}
exports.NotificationService = NotificationService;
