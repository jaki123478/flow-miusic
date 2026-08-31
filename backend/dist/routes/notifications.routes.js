"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_service_1 = require("../services/notification.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
router.get('/', async (req, res) => {
    try {
        const cursor = req.query.cursor;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        const notifications = await notification_service_1.NotificationService.getNotifications(req.user.id, cursor, limit);
        res.json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:id/read', async (req, res) => {
    try {
        await notification_service_1.NotificationService.markAsRead(req.params.id, req.user.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/read-all', async (req, res) => {
    try {
        await notification_service_1.NotificationService.markAllAsRead(req.user.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/unread-count', async (req, res) => {
    try {
        const count = await notification_service_1.NotificationService.getUnreadCount(req.user.id);
        res.json({ success: true, data: count });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
