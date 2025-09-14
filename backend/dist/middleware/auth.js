"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireManager = requireManager;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ error: 'Unauthenticated' });
    const token = header.replace('Bearer ', '');
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev');
        req.user = payload;
        next();
    }
    catch (e) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
function requireManager(req, res, next) {
    if (req.user?.role !== 'MANAGER')
        return res.status(403).json({ error: 'Forbidden' });
    next();
}
//# sourceMappingURL=auth.js.map