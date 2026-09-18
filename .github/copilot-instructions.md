# GitHub Copilot / coding agents — Flow Music

Jacopo lock: **do not modify player or stream stack** unless the user explicitly requested an audio fix in this session.

Protected:
- `src/components/flow/player.tsx`
- `src/lib/music/stream-url.ts`, `native-audio.ts`, `offline-audio.ts`, `background-audio.ts`, `play-src.ts`, `lock-screen.ts`
- PC proxy `C:\Users\Jaki1\flow-yt-proxy` (out of repo but must not be restarted/rewritten by agents)

Catalog audio must keep using off-Vercel `STREAM_PROXY_ORIGIN`. No Vercel catalog `/api/stream` and no YouTube iframe for catalog play.

Prefer additive UI changes that leave protected files untouched. See `AGENTS.md`.
