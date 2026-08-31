"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialService = void 0;
const database_1 = __importDefault(require("../config/database"));
const notification_service_1 = require("./notification.service");
class SocialService {
    static async getFeed(userId, cursor, limit = 20) {
        let whereClause = {};
        if (userId) {
            const following = await database_1.default.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true }
            });
            const followingIds = following.map(f => f.followingId);
            followingIds.push(userId); // includi i propri post
            whereClause = { userId: { in: followingIds } };
        }
        const args = {
            where: whereClause,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
                pollVotes: true
            }
        };
        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }
        let posts = await database_1.default.post.findMany(args);
        // Se l'utente non segue nessuno o il feed è vuoto, mostra gli ultimi post pubblici
        if (posts.length === 0 && userId) {
            const publicArgs = {
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                    _count: { select: { likes: true, comments: true } },
                    pollVotes: true
                }
            };
            posts = await database_1.default.post.findMany(publicArgs);
        }
        let likedSet = new Set();
        if (userId && posts.length > 0) {
            const likedPostIds = await database_1.default.postLike.findMany({
                where: { userId, postId: { in: posts.map(p => p.id) } },
                select: { postId: true }
            });
            likedSet = new Set(likedPostIds.map(l => l.postId));
        }
        return posts.map(post => {
            const formatted = SocialService.formatPost(post, userId);
            formatted.isLiked = likedSet.has(post.id);
            return formatted;
        });
    }
    static async createPost(userId, content, imageUrl, musicData, pollData) {
        const post = await database_1.default.post.create({
            data: {
                userId,
                content,
                imageUrl,
                musicVideoId: musicData?.videoId,
                musicTitle: musicData?.title,
                musicArtist: musicData?.artist,
                musicThumbnail: musicData?.thumbnailUrl,
                pollQuestion: pollData?.question || null,
                pollOptions: pollData?.options ? JSON.stringify(pollData.options) : null
            },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } }
            }
        });
        return {
            ...post,
            likeCount: 0,
            commentCount: 0,
            isLiked: false,
            poll: pollData?.options ? {
                question: pollData.question,
                options: pollData.options,
                votes: pollData.options.map(() => 0),
                userVotedOptionIdx: null
            } : null
        };
    }
    static async deletePost(userId, postId) {
        const post = await database_1.default.post.findUnique({ where: { id: postId } });
        if (!post || post.userId !== userId) {
            throw new Error('Non autorizzato o post non trovato');
        }
        await database_1.default.post.delete({ where: { id: postId } });
        return true;
    }
    static async likePost(userId, postId) {
        const existing = await database_1.default.postLike.findUnique({
            where: {
                userId_postId: { userId, postId }
            }
        });
        if (existing) {
            await database_1.default.postLike.delete({
                where: {
                    userId_postId: { userId, postId }
                }
            });
            return { liked: false };
        }
        await database_1.default.postLike.create({
            data: { userId, postId }
        });
        const post = await database_1.default.post.findUnique({ where: { id: postId } });
        if (post && post.userId !== userId) {
            await notification_service_1.NotificationService.createNotification(post.userId, userId, 'LIKE', postId);
        }
        return { liked: true };
    }
    static async unlikePost(userId, postId) {
        await database_1.default.postLike.deleteMany({
            where: { userId, postId }
        });
        return { liked: false };
    }
    static async getComments(postId, cursor, limit = 20) {
        const args = {
            where: { postId, parentId: null },
            take: limit,
            orderBy: { createdAt: 'asc' },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                replies: {
                    include: {
                        user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        };
        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }
        return database_1.default.postComment.findMany(args);
    }
    static async addComment(userId, postId, content, parentId) {
        const comment = await database_1.default.postComment.create({
            data: {
                userId,
                postId,
                content,
                parentId
            },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } }
            }
        });
        const post = await database_1.default.post.findUnique({ where: { id: postId } });
        if (post && post.userId !== userId) {
            await notification_service_1.NotificationService.createNotification(post.userId, userId, 'COMMENT', postId, undefined, content.slice(0, 50));
        }
        return comment;
    }
    static async deleteComment(userId, commentId) {
        const comment = await database_1.default.postComment.findUnique({ where: { id: commentId } });
        if (!comment || comment.userId !== userId) {
            throw new Error('Non autorizzato');
        }
        await database_1.default.postComment.delete({ where: { id: commentId } });
        return true;
    }
    static async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error('Non puoi seguire te stesso');
        }
        const existing = await database_1.default.follow.findUnique({
            where: {
                followerId_followingId: { followerId, followingId }
            }
        });
        if (existing)
            return { following: true };
        await database_1.default.follow.create({
            data: { followerId, followingId }
        });
        await notification_service_1.NotificationService.createNotification(followingId, followerId, 'FOLLOW');
        return { following: true };
    }
    static async unfollowUser(followerId, followingId) {
        await database_1.default.follow.deleteMany({
            where: { followerId, followingId }
        });
        return { following: false };
    }
    static async getFollowers(userId, currentUserId) {
        const followers = await database_1.default.follow.findMany({
            where: { followingId: userId },
            include: {
                follower: {
                    select: { id: true, username: true, displayName: true, avatarUrl: true }
                }
            }
        });
        const followerUsers = followers.map(f => f.follower);
        if (!currentUserId)
            return followerUsers.map(u => ({ ...u, isFollowing: false }));
        const myFollows = await database_1.default.follow.findMany({
            where: { followerId: currentUserId, followingId: { in: followerUsers.map(u => u.id) } },
            select: { followingId: true }
        });
        const followSet = new Set(myFollows.map(f => f.followingId));
        return followerUsers.map(u => ({ ...u, isFollowing: followSet.has(u.id) }));
    }
    static async getFollowing(userId, currentUserId) {
        const following = await database_1.default.follow.findMany({
            where: { followerId: userId },
            include: {
                following: {
                    select: { id: true, username: true, displayName: true, avatarUrl: true }
                }
            }
        });
        const followingUsers = following.map(f => f.following);
        if (!currentUserId)
            return followingUsers.map(u => ({ ...u, isFollowing: false }));
        const myFollows = await database_1.default.follow.findMany({
            where: { followerId: currentUserId, followingId: { in: followingUsers.map(u => u.id) } },
            select: { followingId: true }
        });
        const followSet = new Set(myFollows.map(f => f.followingId));
        return followingUsers.map(u => ({ ...u, isFollowing: followSet.has(u.id) }));
    }
    static async getPostById(postId, currentUserId) {
        const post = await database_1.default.post.findUnique({
            where: { id: postId },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
                pollVotes: true
            }
        });
        if (!post)
            return null;
        let isLiked = false;
        if (currentUserId) {
            const like = await database_1.default.postLike.findUnique({
                where: { userId_postId: { userId: currentUserId, postId } }
            });
            isLiked = Boolean(like);
        }
        const formatted = SocialService.formatPost(post, currentUserId);
        formatted.isLiked = isLiked;
        return formatted;
    }
    static async getUserPosts(userId, currentUserId, cursor, limit = 20) {
        const args = {
            where: { userId },
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
                pollVotes: true
            }
        };
        if (cursor) {
            args.cursor = { id: cursor };
            args.skip = 1;
        }
        const posts = await database_1.default.post.findMany(args);
        let likedSet = new Set();
        if (currentUserId) {
            const likedPostIds = await database_1.default.postLike.findMany({
                where: { userId: currentUserId, postId: { in: posts.map(p => p.id) } },
                select: { postId: true }
            });
            likedSet = new Set(likedPostIds.map(l => l.postId));
        }
        return posts.map(post => {
            const formatted = SocialService.formatPost(post, currentUserId);
            formatted.isLiked = likedSet.has(post.id);
            return formatted;
        });
    }
    static async getPostLikes(postId) {
        return database_1.default.postLike.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    static formatPost(post, currentUserId) {
        let poll = null;
        if (post.pollQuestion && post.pollOptions) {
            try {
                const options = JSON.parse(post.pollOptions);
                const votes = options.map(() => 0);
                let userVotedOptionIdx = null;
                if (post.pollVotes) {
                    post.pollVotes.forEach((v) => {
                        if (v.optionIdx >= 0 && v.optionIdx < votes.length) {
                            votes[v.optionIdx]++;
                        }
                        if (currentUserId && v.userId === currentUserId) {
                            userVotedOptionIdx = v.optionIdx;
                        }
                    });
                }
                poll = {
                    question: post.pollQuestion,
                    options,
                    votes,
                    userVotedOptionIdx
                };
            }
            catch { }
        }
        return {
            id: post.id,
            userId: post.userId,
            content: post.content,
            imageUrl: post.imageUrl,
            musicVideoId: post.musicVideoId,
            musicTitle: post.musicTitle,
            musicArtist: post.musicArtist,
            musicThumbnail: post.musicThumbnail,
            createdAt: post.createdAt,
            user: post.user,
            likeCount: post._count?.likes ?? post.likeCount ?? 0,
            commentCount: post._count?.comments ?? post.commentCount ?? 0,
            isLiked: post.isLiked ?? false,
            poll
        };
    }
    static async votePoll(userId, postId, optionIdx) {
        const post = await database_1.default.post.findUnique({
            where: { id: postId },
            include: { pollVotes: true }
        });
        if (!post || !post.pollQuestion || !post.pollOptions) {
            throw new Error('Sondaggio non trovato');
        }
        const options = JSON.parse(post.pollOptions);
        if (optionIdx < 0 || optionIdx >= options.length) {
            throw new Error('Opzione non valida');
        }
        // Upsert vote
        const vote = await database_1.default.postPollVote.upsert({
            where: { userId_postId: { userId, postId } },
            update: { optionIdx },
            create: { userId, postId, optionIdx }
        });
        return vote;
    }
    static async searchPosts(query, currentUserId) {
        if (!query)
            return [];
        const posts = await database_1.default.post.findMany({
            where: {
                content: {
                    contains: query
                }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
                _count: { select: { likes: true, comments: true } },
                pollVotes: true
            }
        });
        let likedSet = new Set();
        if (currentUserId && posts.length > 0) {
            const likedPostIds = await database_1.default.postLike.findMany({
                where: { userId: currentUserId, postId: { in: posts.map(p => p.id) } },
                select: { postId: true }
            });
            likedSet = new Set(likedPostIds.map(l => l.postId));
        }
        return posts.map(post => {
            const formatted = SocialService.formatPost(post, currentUserId);
            formatted.isLiked = likedSet.has(post.id);
            return formatted;
        });
    }
}
exports.SocialService = SocialService;
