# CLAUDE / ChatGPT / Codex — Flow Music lock

You are working in **flow-miusic** (Flow Music). Jacopo's standing order:

**Do not modify the audio player or streaming stack** unless Jacopo explicitly asked you in this chat to fix audio.

Protected paths (hands off):
- `src/components/flow/player.tsx`
- `src/lib/music/stream-url.ts`
- `src/lib/music/native-audio.ts`
- `src/lib/music/offline-audio.ts`
- `src/lib/music/background-audio.ts`
- `src/lib/music/play-src.ts`
- `src/lib/music/lock-screen.ts`
- Anything under PC `C:\Users\Jaki1\flow-yt-proxy`

Do not route catalog playback through Vercel `/api/stream` or a YouTube iframe. Catalog audio goes through `STREAM_PROXY_ORIGIN` (Cloudflare tunnel → PC proxy).

If the ask is unrelated UI, leave protected files unchanged. If audio is broken, say so and stop — Jacopo should ask **jaki**.

See also `AGENTS.md` (top section) and `.github/copilot-instructions.md`.
