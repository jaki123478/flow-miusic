# Gemini — Flow Music lock

Standing order from Jacopo for this repository:

**Do not change the player or streaming/proxy stack** unless Jacopo explicitly asked you in this session to fix audio.

Never edit: `src/components/flow/player.tsx`, `src/lib/music/stream-url.ts`, `src/lib/music/native-audio.ts`, `src/lib/music/offline-audio.ts`, `src/lib/music/background-audio.ts`, `src/lib/music/play-src.ts`, `src/lib/music/lock-screen.ts`, or the Windows folder `C:\Users\Jaki1\flow-yt-proxy`.

Do not point catalog play at Vercel `/api/stream` or YouTube embeds. Use `catalogStreamUrl` / `STREAM_PROXY_ORIGIN` only as already wired.

If audio fails, do not "fix" it — tell Jacopo to use assistant **jaki**.

Full rules: top of `AGENTS.md`.
