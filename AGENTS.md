# Agent lock — Flow Music

**Owner:** assistant **jaki** (Jacopo). Other agents: **do not touch** the streaming stack.

## Hands off unless Jacopo asks *you* in that chat

- `C:\Users\Jaki1\flow-yt-proxy` — `boot.mjs`, `cloudflared`, `StayAwake`, `keep-flow-*.ps1`, `tunnel-url.txt`
- `STREAM_PROXY_ORIGIN` / `STREAM_PROXY_BUILD` in `src/lib/music/stream-url.ts`
- Player / native-audio / offline-audio / catalog stream client paths
- Pointing catalog audio at Vercel `/api/stream` or a YouTube iframe

## Allowed without touching stream

Additive UI (search, artist/album pages, etc.) that does **not** change playback or proxy wiring.

## If audio is broken

Tell Jacopo to ask **jaki**. Do not restart the PC proxy or force a stream URL PR on your own.

## Live

- App: https://flow-music-web.vercel.app/
- Catalog audio: PC proxy via Cloudflare quick tunnel (`STREAM_PROXY_ORIGIN`)
