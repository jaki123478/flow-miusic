"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const flowai_service_1 = require("../services/flowai.service");
const router = (0, express_1.Router)();
router.post('/chat', async (req, res) => {
    try {
        const { prompt, history } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, error: 'Prompt richiesto' });
        }
        const reply = await flowai_service_1.FlowAIService.generateReply(prompt, history || []);
        res.json({
            success: true,
            data: {
                reply,
                learnedInsights: flowai_service_1.FlowAIService.getKnowledge().slice(0, 3)
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/knowledge', async (_req, res) => {
    try {
        const knowledge = flowai_service_1.FlowAIService.getKnowledge();
        res.json({ success: true, data: knowledge });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/learn', async (req, res) => {
    try {
        const { topic } = req.body;
        const learned = await flowai_service_1.FlowAIService.learnFromInternet(topic);
        res.json({ success: true, data: learned });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/playlist/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt)
            return res.status(400).json({ success: false, error: 'Descrivi la playlist che desideri' });
        const playlist = await flowai_service_1.FlowAIService.generateSmartPlaylist(prompt);
        res.json({ success: true, data: playlist });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/captions/generate', async (req, res) => {
    try {
        const { context } = req.body;
        const captions = await flowai_service_1.FlowAIService.generateCaptionsAndHashtags(context);
        res.json({ success: true, data: captions });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
