# Flow Music stream proxy (Cloudflare Worker)

Resolves YouTube Music catalog IDs via InnerTube **IOS 20.11.6** (plaintext audio URLs) and **pipes googlevideo bytes** with Range/206. Same isolate must both resolve and proxy — googlevideo URLs are IP-locked. Never 302 the client to googlevideo.

## Endpoints

- `GET /api/stream?id=VIDEO_ID` (also `/stream?id=` and `?v=`)
- `GET /health` → `ok`

CORS: `https://flow-music-web.vercel.app`, `https://flow-music-app-two.vercel.app`, other `*.vercel.app`.

## Local (this machine, no Wrangler account needed)

```
node server/stream-proxy.mjs
cloudflared tunnel --url http://127.0.0.1:8787
```

Point the Flow client at `https://<tunnel>/api/stream?id=VIDEO_ID` (`VITE_STREAM_PROXY`).

## Deploy Worker

```
cd workers/stream-proxy
npx wrangler login
npx wrangler deploy
```

Do **not** send catalog audio through Vercel — Vercel IPs get InnerTube `This video is unavailable`.
