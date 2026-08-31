"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const highlight_service_1 = require("../services/highlight.service");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/user/:userId', auth_1.optionalAuth, async (req, res) => {
    try {
        const highlights = await highlight_service_1.HighlightService.getUserHighlights(req.params.userId);
        res.json({ success: true, data: highlights });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/', auth_1.verifyToken, async (req, res) => {
    try {
        const { title, coverUrl, storyIds } = req.body;
        if (!title)
            throw new Error('Titolo richiesto');
        const highlight = await highlight_service_1.HighlightService.createHighlight(req.user.id, title, coverUrl, storyIds || []);
        res.status(201).json({ success: true, data: highlight });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
router.delete('/:id', auth_1.verifyToken, async (req, res) => {
    try {
        await highlight_service_1.HighlightService.deleteHighlight(req.user.id, req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(403).json({ success: false, error: error.message });
    }
});
exports.default = router;
