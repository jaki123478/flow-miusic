"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    return null;
};
// Middleware per rotte protette: richiede token JWT valido reale
const verifyToken = async (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Accesso non autorizzato. Effettua il login per continuare.'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'access-secret');
        const userId = decoded.userId || decoded.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Token non valido.' });
        }
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, username: true }
        });
        if (!user) {
            return res.status(401).json({ success: false, error: 'Utente non trovato.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Sessione scaduta o non valida. Effettua nuovamente il login.'
        });
    }
};
exports.verifyToken = verifyToken;
// Middleware per rotte pubbliche con supporto auth opzionale
const optionalAuth = async (req, _res, next) => {
    try {
        const token = extractToken(req);
        if (token) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'access-secret');
                const userId = decoded.userId || decoded.id;
                if (userId) {
                    const user = await database_1.default.user.findUnique({
                        where: { id: userId },
                        select: { id: true, username: true }
                    });
                    if (user) {
                        req.user = user;
                    }
                }
            }
            catch {
                // Token non valido: continua come ospite
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
