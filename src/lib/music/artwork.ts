import { FALLBACK_ART } from "@/lib/music/types";

/** Bump YouTube / Google thumb URLs to a sharper square (or hq720 for video thumbs). */
export function upgradeArtworkUrl(
  url: string | undefined | null,
  videoId?: string | null,
  size = 544,
): string {
  const id = String(videoId || "").trim();
  const safeId = /^[\w-]{11}$/.test(id) ? id : "";
  const raw = String(url || "").trim();
  if (!raw) {
    return safeId ? `https://i.ytimg.com/vi/${safeId}/hq720.jpg` : FALLBACK_ART;
  }

  // YouTube video stills: drop tiny sqp crops, use hq720 (maxres often 404).
  const yt = raw.match(/i\.ytimg\.com\/vi\/([\w-]{11})\//i);
  if (yt) {
    return `https://i.ytimg.com/vi/${yt[1]}/hq720.jpg`;
  }

  let out = raw;
  // googleusercontent / ggplh style size suffixes: =w60-h60-l90-rj → larger
  if (/=w\d+-h\d+/i.test(out)) {
    out = out.replace(/=w\d+-h\d+(-[a-z0-9-]+)?$/i, `=w${size}-h${size}-l90-rj`);
  } else if (/=s\d+/i.test(out)) {
    out = out.replace(/=s\d+/i, `=s${size}`);
  } else if (/googleusercontent\.com|yt3\.ggpht\.com/i.test(out) && !/[=?]/.test(out.split("/").pop() || "")) {
    out = `${out}=w${size}-h${size}-l90-rj`;
  }

  return out || (safeId ? `https://i.ytimg.com/vi/${safeId}/hq720.jpg` : FALLBACK_ART);
}

export function artworkSrcSet(url: string | undefined | null, videoId?: string | null): string {
  const s320 = upgradeArtworkUrl(url, videoId, 320);
  const s544 = upgradeArtworkUrl(url, videoId, 544);
  const s800 = upgradeArtworkUrl(url, videoId, 800);
  return `${s320} 320w, ${s544} 544w, ${s800} 800w`;
}
