import { getPlayUrl } from "./catalog";

export async function resolveDirectUrl(videoId: string): Promise<string | null> {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return null;
  try {
    const out = await getPlayUrl({ data: { v: id } });
    return out?.url || null;
  } catch {
    return null;
  }
}
