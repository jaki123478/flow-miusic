"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const JWT_ACCESS_SECRET = process.env.JWT_SECRET || 'access-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
class AuthService {
    static generateTokens(userId) {
        // Token permanenti a lunga durata (10 anni) per non disconnettere mai l'utente
        const accessToken = jsonwebtoken_1.default.sign({ userId }, JWT_ACCESS_SECRET, { expiresIn: '3650d' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '3650d' });
        return { accessToken, refreshToken };
    }
    static async register(username, email, password, displayName) {
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();
        const existingUser = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { email: cleanEmail },
                    { username: cleanUsername }
                ]
            }
        });
        if (existingUser) {
            if (existingUser.username.toLowerCase() === cleanUsername) {
                throw new Error('Questo username è già in uso');
            }
            throw new Error('Questa email è già registrata');
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await database_1.default.user.create({
            data: {
                username: cleanUsername,
                email: cleanEmail,
                passwordHash: hashedPassword,
                displayName: displayName.trim() || cleanUsername,
            }
        });
        const tokens = this.generateTokens(user.id);
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bannerUrl: user.bannerUrl
            },
            ...tokens
        };
    }
    static async login(identifier, password) {
        const cleanIdentifier = identifier.trim().toLowerCase();
        // Supporta login sia con email che con username
        const user = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { email: cleanIdentifier },
                    { username: cleanIdentifier }
                ]
            }
        });
        if (!user) {
            throw new Error('Credenziali non valide (username o email non trovati)');
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Password errata');
        }
        const tokens = this.generateTokens(user.id);
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                bannerUrl: user.bannerUrl
            },
            ...tokens
        };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_REFRESH_SECRET);
            const user = await database_1.default.user.findUnique({ where: { id: decoded.userId } });
            if (!user)
                throw new Error('Utente non trovato');
            return this.generateTokens(user.id);
        }
        catch (error) {
            throw new Error('Refresh token non valido o scaduto');
        }
    }
    static async getProfile(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                bannerUrl: true,
                profileWebsite: true,
                profileLocation: true,
                profileSongVideoId: true,
                profileSongTitle: true,
                profileSongArtist: true,
                profileSongThumbnail: true,
                createdAt: true,
                _count: {
                    select: { followers: true, following: true, posts: true }
                }
            }
        });
        if (!user)
            throw new Error('Utente non trovato');
        return user;
    }
    static async getUserByUsername(rawUsername, currentUserId) {
        if (!rawUsername)
            throw new Error('Username richiesto');
        const clean = decodeURIComponent(rawUsername).trim().replace(/^@/, '');
        if ((clean === 'me' || clean === '') && currentUserId) {
            return this.getProfile(currentUserId);
        }
        const user = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { username: clean },
                    { username: clean.toLowerCase() },
                    { id: clean }
                ]
            },
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                bannerUrl: true,
                profileWebsite: true,
                profileLocation: true,
                profileSongVideoId: true,
                profileSongTitle: true,
                profileSongArtist: true,
                profileSongThumbnail: true,
                createdAt: true,
                _count: {
                    select: { followers: true, following: true, posts: true }
                }
            }
        });
        if (!user) {
            if (currentUserId && (clean === 'me' || clean === 'profile')) {
                const fallbackMe = await database_1.default.user.findUnique({ where: { id: currentUserId } });
                if (fallbackMe)
                    return this.getProfile(currentUserId);
            }
            throw new Error('Utente non trovato');
        }
        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
            const follow = await database_1.default.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id
                    }
                }
            });
            isFollowing = Boolean(follow);
        }
        return { ...user, isFollowing };
    }
    static async updateProfile(userId, data) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('Utente non trovato');
        const updateData = {};
        // Modifica Username
        if (data.username && data.username.trim() && data.username.trim().toLowerCase() !== user.username) {
            const cleanUsername = data.username.trim().toLowerCase().replace(/\s+/g, '_');
            const existing = await database_1.default.user.findUnique({ where: { username: cleanUsername } });
            if (existing && existing.id !== userId) {
                throw new Error('Questo username è già in uso. Scegline un altro.');
            }
            updateData.username = cleanUsername;
        }
        // Modifica Email
        if (data.email && data.email.trim() && data.email.trim().toLowerCase() !== user.email) {
            const cleanEmail = data.email.trim().toLowerCase();
            const existing = await database_1.default.user.findUnique({ where: { email: cleanEmail } });
            if (existing && existing.id !== userId) {
                throw new Error('Questa email è già associata a un altro account.');
            }
            updateData.email = cleanEmail;
        }
        // Modifica Password
        if (data.newPassword && data.newPassword.trim()) {
            if (!data.oldPassword) {
                throw new Error('Inserisci la vecchia password per confermare la modifica.');
            }
            const isMatch = await bcryptjs_1.default.compare(data.oldPassword, user.passwordHash);
            if (!isMatch) {
                throw new Error('La vecchia password inserita non è corretta.');
            }
            if (data.newPassword.length < 6) {
                throw new Error('La nuova password deve contenere almeno 6 caratteri.');
            }
            updateData.passwordHash = await bcryptjs_1.default.hash(data.newPassword, 10);
        }
        // Altri campi profilo
        if (data.displayName !== undefined)
            updateData.displayName = data.displayName;
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.avatarUrl !== undefined)
            updateData.avatarUrl = data.avatarUrl;
        if (data.bannerUrl !== undefined)
            updateData.bannerUrl = data.bannerUrl;
        if (data.profileWebsite !== undefined)
            updateData.profileWebsite = data.profileWebsite;
        if (data.profileLocation !== undefined)
            updateData.profileLocation = data.profileLocation;
        if (data.profileSongVideoId !== undefined)
            updateData.profileSongVideoId = data.profileSongVideoId;
        if (data.profileSongTitle !== undefined)
            updateData.profileSongTitle = data.profileSongTitle;
        if (data.profileSongArtist !== undefined)
            updateData.profileSongArtist = data.profileSongArtist;
        if (data.profileSongThumbnail !== undefined)
            updateData.profileSongThumbnail = data.profileSongThumbnail;
        return database_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                bannerUrl: true,
                profileWebsite: true,
                profileLocation: true,
                profileSongVideoId: true,
                profileSongTitle: true,
                profileSongArtist: true,
                profileSongThumbnail: true,
            }
        });
    }
    static async createNote(userId, data) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        // Elimina vecchia nota se presente
        await database_1.default.note.deleteMany({ where: { userId } });
        return database_1.default.note.create({
            data: {
                userId,
                text: data.text || null,
                musicVideoId: data.musicVideoId || null,
                musicTitle: data.musicTitle || null,
                musicArtist: data.musicArtist || null,
                musicThumbnail: data.musicThumbnail || null,
                expiresAt
            },
            include: {
                user: {
                    select: { id: true, username: true, displayName: true, avatarUrl: true }
                }
            }
        });
    }
    static async getActiveNotes() {
        const now = new Date();
        return database_1.default.note.findMany({
            where: {
                expiresAt: { gt: now }
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { id: true, username: true, displayName: true, avatarUrl: true }
                }
            }
        });
    }
    static async changePassword(userId, oldPassword, newPassword) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('Utente non trovato');
        const isValid = await bcryptjs_1.default.compare(oldPassword, user.passwordHash);
        if (!isValid)
            throw new Error('Vecchia password errata');
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await database_1.default.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword }
        });
        return true;
    }
    static async searchUsers(query, currentUserId) {
        const cleanQuery = (query || '').trim().toLowerCase();
        const whereClause = {};
        if (cleanQuery) {
            whereClause.OR = [
                { username: { contains: cleanQuery } },
                { displayName: { contains: cleanQuery } }
            ];
        }
        if (currentUserId) {
            whereClause.id = { not: currentUserId };
        }
        const users = await database_1.default.user.findMany({
            where: whereClause,
            take: 30,
            select: {
                id: true,
                username: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                createdAt: true,
                _count: {
                    select: { followers: true, posts: true }
                }
            }
        });
        let followSet = new Set();
        if (currentUserId) {
            const myFollows = await database_1.default.follow.findMany({
                where: {
                    followerId: currentUserId,
                    followingId: { in: users.map(u => u.id) }
                },
                select: { followingId: true }
            });
            followSet = new Set(myFollows.map(f => f.followingId));
        }
        // Ordinamento per pertinenza: corrispondenza esatta prima, prefisso secondo
        const sorted = users.map(user => ({
            ...user,
            isFollowing: followSet.has(user.id)
        })).sort((a, b) => {
            const aExact = a.username.toLowerCase() === cleanQuery || a.displayName?.toLowerCase() === cleanQuery;
            const bExact = b.username.toLowerCase() === cleanQuery || b.displayName?.toLowerCase() === cleanQuery;
            if (aExact && !bExact)
                return -1;
            if (!aExact && bExact)
                return 1;
            const aStarts = a.username.toLowerCase().startsWith(cleanQuery);
            const bStarts = b.username.toLowerCase().startsWith(cleanQuery);
            if (aStarts && !bStarts)
                return -1;
            if (!aStarts && bStarts)
                return 1;
            return (b._count?.followers || 0) - (a._count?.followers || 0);
        });
        return sorted;
    }
    // Lista Amici Più Stretti (Close Friends)
    static async toggleCloseFriend(userId, targetUserId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('Utente non trovato');
        let list = [];
        try {
            list = JSON.parse(user.closeFriends || '[]');
        }
        catch { }
        const isAlready = list.includes(targetUserId);
        if (isAlready) {
            list = list.filter(id => id !== targetUserId);
        }
        else {
            list.push(targetUserId);
        }
        await database_1.default.user.update({
            where: { id: userId },
            data: { closeFriends: JSON.stringify(list) }
        });
        return { isCloseFriend: !isAlready, closeFriends: list };
    }
    static async getCloseFriends(userId) {
        const user = await database_1.default.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('Utente non trovato');
        let list = [];
        try {
            list = JSON.parse(user.closeFriends || '[]');
        }
        catch { }
        const users = await database_1.default.user.findMany({
            where: { id: { in: list } },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true
            }
        });
        return users;
    }
    // Dashboard Statistiche & Creator Insights
    static async getCreatorInsights(userId) {
        const [posts, followersCount, followingCount, storiesCount, likedTracksCount] = await Promise.all([
            database_1.default.post.findMany({
                where: { userId },
                include: {
                    _count: { select: { likes: true, comments: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            database_1.default.follow.count({ where: { followingId: userId } }),
            database_1.default.follow.count({ where: { followerId: userId } }),
            database_1.default.story.count({ where: { userId } }),
            database_1.default.likedTrack.count({ where: { userId } })
        ]);
        const totalLikes = posts.reduce((sum, p) => sum + (p._count.likes || 0), 0);
        const totalComments = posts.reduce((sum, p) => sum + (p._count.comments || 0), 0);
        const estimatedImpressions = (posts.length * 150) + (totalLikes * 8) + (followersCount * 12);
        const topPost = posts.sort((a, b) => (b._count.likes + b._count.comments) - (a._count.likes + a._count.comments))[0] || null;
        return {
            totalPosts: posts.length,
            followersCount,
            followingCount,
            storiesCount,
            likedTracksCount,
            totalLikes,
            totalComments,
            estimatedImpressions,
            topPost,
            bestTimeToPost: '18:00 - 21:30',
            engagementRate: followersCount > 0 ? ((totalLikes + totalComments) / (followersCount * Math.max(1, posts.length)) * 100).toFixed(1) + '%' : '0%'
        };
    }
}
exports.AuthService = AuthService;
