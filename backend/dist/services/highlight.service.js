"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HighlightService = void 0;
const database_1 = __importDefault(require("../config/database"));
class HighlightService {
    static async createHighlight(userId, title, coverUrl, storyIds = []) {
        return database_1.default.highlight.create({
            data: {
                userId,
                title,
                coverUrl: coverUrl || null,
                storyIds: JSON.stringify(storyIds)
            }
        });
    }
    static async getUserHighlights(userId) {
        const highlights = await database_1.default.highlight.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        const enriched = await Promise.all(highlights.map(async (h) => {
            let parsedStoryIds = [];
            try {
                parsedStoryIds = JSON.parse(h.storyIds || '[]');
            }
            catch { }
            const stories = await database_1.default.story.findMany({
                where: { id: { in: parsedStoryIds } },
                include: {
                    user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
                }
            });
            return {
                ...h,
                stories: stories || []
            };
        }));
        return enriched;
    }
    static async deleteHighlight(userId, highlightId) {
        const highlight = await database_1.default.highlight.findFirst({
            where: { id: highlightId, userId }
        });
        if (!highlight)
            throw new Error('Highlight non trovato o non autorizzato');
        return database_1.default.highlight.delete({
            where: { id: highlightId }
        });
    }
}
exports.HighlightService = HighlightService;
