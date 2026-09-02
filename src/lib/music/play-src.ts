import { catalogStreamUrl } from "./stream-url";

export async function resolveDirectUrl(videoId: string): Promise<string | null> {
  const id = videoId.trim();
  if (!/^[\w-]{11}$/.test(id)) return null;
  return catalogStreamUrl(id) || null;
}
