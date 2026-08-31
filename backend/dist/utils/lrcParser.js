"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveLine = exports.formatTime = exports.parseLRC = void 0;
const parseLRC = (lrcString) => {
    const lines = lrcString.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;
    lines.forEach(line => {
        let match;
        const timestamps = [];
        // Extract all timestamps on this line
        while ((match = timeRegex.exec(line)) !== null) {
            const min = parseInt(match[1], 10);
            const sec = parseInt(match[2], 10);
            const msPart = match[3];
            const ms = msPart.length === 2 ? parseInt(msPart, 10) * 10 : parseInt(msPart, 10);
            timestamps.push((min * 60 + sec) * 1000 + ms);
        }
        // Remove all timestamps to get the text
        const text = line.replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '').trim();
        // Ignore pure metadata lines like [ar:Artist] if there's no match
        if (timestamps.length === 0)
            return;
        timestamps.forEach(timeMs => {
            result.push({ timeMs, text });
        });
    });
    return result.sort((a, b) => a.timeMs - b.timeMs);
};
exports.parseLRC = parseLRC;
const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
exports.formatTime = formatTime;
const findActiveLine = (lines, currentTimeMs) => {
    for (let i = lines.length - 1; i >= 0; i--) {
        if (currentTimeMs >= lines[i].timeMs) {
            return i;
        }
    }
    return -1;
};
exports.findActiveLine = findActiveLine;
