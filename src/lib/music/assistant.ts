import { createServerFn } from "@tanstack/react-start";
import { createMoodMix, getRelatedTracks, getTopRadios, searchCatalog } from "@/lib/music/catalog";
import { getTrackLyrics } from "@/lib/music/lyrics";
import type { RadioStation, Track } from "@/lib/music/types";

export type ChatMsg = { role: "user" | "assistant"; text: string };
export type ChatIntent =
  | "play"
  | "queue"
  | "search"
  | "radio"
  | "lyrics"
  | "similar"
  | "mood"
  | "skip"
  | "pause"
  | "resume"
  | "love"
  | "help"
  | "chat";
export type ChatResult = {
  reply: string;
  intent: ChatIntent;
  tracks: Track[];
  radios: RadioStation[];
};

const INTENTS: ChatIntent[] = [
  "play",
  "queue",
  "search",
  "radio",
  "lyrics",
  "similar",
  "mood",
  "skip",
  "pause",
  "resume",
  "love",
  "help",
  "chat",
];

function isIntent(v: string): v is ChatIntent {
  return (INTENTS as string[]).includes(v);
}

function result(reply: string, intent: ChatIntent, tracks: Track[] = [], radios: RadioStation[] = []): ChatResult {
  return { reply, intent, tracks: tracks.slice(0, 8), radios: radios.slice(0, 6) };
}

function fallbackReply(intent: ChatIntent, query: string, title?: string): string {
  switch (intent) {
    case "play":
      return query ? `Metto su ${query}.` : "Cosa vuoi ascoltare?";
    case "queue":
      return query ? `In coda: ${query}.` : "Lo aggiungo in coda.";
    case "search":
      return query ? `Cerco «${query}».` : "Dimmi un titolo o un artista.";
    case "radio":
      return "Ti sintonizzo sulle radio del momento.";
    case "lyrics":
      return title ? `Ti cerco il testo di ${title}.` : "Avvia un brano e ti mostro il testo.";
    case "similar":
      return title ? `Una selezione vicina a ${title}.` : "Avvia un brano e ti consiglio i simili.";
    case "mood":
      return "Ti preparo un mix per questo mood.";
    case "skip":
      return "Salto al prossimo.";
    case "pause":
      return "Pausa. Dimmi quando riprendere.";
    case "resume":
      return "Ripartiamo.";
    case "love":
      return "Salvato tra i preferiti.";
    case "help":
      return "Posso riprodurre, mettere in coda, cercare, accendere una radio, mostrarti il testo, trovare simili o creare un mix. Dimmi pure.";
    case "chat":
      return "Sono Flow. Dimmi un brano, un mood o una radio e ci penso io.";
  }
}

function stripLead(msg: string, re: RegExp): string {
  const next = msg.replace(re, "").replace(/^[,\s:.–—-]+/, "").trim();
  return next === msg ? "" : next;
}

function looksLikeSong(msg: string): boolean {
  if (/[?]/.test(msg)) return false;
  if (/^(ciao|hey|hola|salve|grazie|buongiorno|buonasera|ok|va bene|chi sei|come stai|come va)\b/i.test(msg)) {
    return false;
  }
  if (/["«»]/.test(msg) || /\s[-–—]\s/.test(msg)) return true;
  const words = msg.split(/\s+/).filter(Boolean);
  return words.length >= 1 && words.length <= 8 && msg.length >= 2 && msg.length <= 80;
}

function parseRuleBased(message: string): { intent: ChatIntent; query: string } {
  const msg = message.trim();

  if (/radio/i.test(msg)) {
    return { intent: "radio", query: stripLead(msg, /^(suona|metti|play|ascolta|accendi)?\s*(la\s+|una\s+)?radio\s*/i) };
  }
  if (/testo|lyrics/i.test(msg)) return { intent: "lyrics", query: "" };
  if (/simile|similar|come questa/i.test(msg)) return { intent: "similar", query: "" };
  if (/pausa|pause/i.test(msg)) return { intent: "pause", query: "" };
  if (/riprendi/i.test(msg) || /^play$/i.test(msg)) return { intent: "resume", query: "" };
  if (/salta|skip|avanti/i.test(msg)) return { intent: "skip", query: "" };
  if (/mi piace|\blike\b|cuore/i.test(msg)) return { intent: "love", query: "" };
  if (/\b(aiuto|help|comandi)\b/i.test(msg)) return { intent: "help", query: "" };
  if (/coda|queue|dopo/i.test(msg)) {
    return {
      intent: "queue",
      query: stripLead(msg, /^(metti|aggiungi|add|play|suona)?\s*(in\s+coda|coda|queue|dopo)\s*/i),
    };
  }
  if (/suona|play|metti|ascolta/i.test(msg)) {
    return {
      intent: "play",
      query: stripLead(msg, /^(ok,?\s*)?(suona|play|metti|ascolta)\s+(la|il|le|un|una|brano|canzone|di)?\s*/i),
    };
  }
  if (/\b(chill|sad|gym|party|nanna|focus)\b/i.test(msg)) {
    return { intent: "mood", query: msg };
  }
  if (looksLikeSong(msg)) return { intent: "search", query: msg };
  return { intent: "chat", query: "" };
}

async function askGrok(
  message: string,
  title?: string,
  artist?: string,
  history?: { role: string; text: string }[],
): Promise<{ reply: string; intent: ChatIntent; query: string } | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const listening = title
    ? `Brano in ascolto: "${title}"${artist ? ` di ${artist}` : ""}.`
    : "Nessun brano in ascolto.";
  const prior = (history || [])
    .filter((h) => (h.role === "user" || h.role === "assistant") && h.text?.trim())
    .slice(-8)
    .map((h) => ({ role: h.role, content: h.text.trim() }));

  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `Sei Flow, assistente musicale. ${listening} Rispondi SOLO con JSON: {"reply":"italiano, 1-3 frasi, tono DJ professionale","intent":"...","query":"stringa ricerca o vuota"}. Intenti: play, queue, search, radio, lyrics, similar, mood, skip, pause, resume, love, help, chat. Non menzionare API o sistemi interni.`,
          },
          ...prior,
          { role: "user", content: message },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = body.choices?.[0]?.message?.content || "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { reply?: string; intent?: string; query?: string };
    const intent = String(parsed.intent || "").trim();
    if (!isIntent(intent)) return null;
    return {
      reply: String(parsed.reply || "").trim(),
      intent,
      query: String(parsed.query || "").trim(),
    };
  } catch {
    return null;
  }
}

export const chatTurn = createServerFn({ method: "POST" })
  .validator((d: { message: string; title?: string; artist?: string; history?: { role: string; text: string }[] }) => d)
  .handler(async ({ data }): Promise<ChatResult> => {
    const message = (data.message || "").trim();
    const title = (data.title || "").trim();
    const artist = (data.artist || "").trim();

    if (!message) {
      return result("Cosa vuoi ascoltare?", "chat");
    }

    const grok = await askGrok(message, title || undefined, artist || undefined, data.history);
    const parsed = grok || parseRuleBased(message);
    const intent = parsed.intent;
    const query = parsed.query;
    const reply = (grok?.reply || "").trim() || fallbackReply(intent, query, title || undefined);

    try {
      if (intent === "play" || intent === "search" || intent === "queue") {
        const q = query || message;
        if (!q || /^(suona|play|metti|ascolta|coda|queue)$/i.test(q)) {
          return result(reply || "Cosa vuoi ascoltare?", intent);
        }
        const found = await searchCatalog({ data: { q } });
        const tracks = found.tracks || [];
        const radios = found.radios || [];
        if (!tracks.length && !radios.length) {
          return result("Non ho trovato nulla. Prova con titolo e artista.", intent);
        }
        return result(reply, intent, tracks, radios);
      }

      if (intent === "similar") {
        if (!title) return result("Avvia un brano e ti consiglio qualcosa di simile.", "similar");
        const tracks = await getRelatedTracks({ data: { artist, title } });
        if (!tracks.length) return result("Non ho trovato brani simili al momento.", "similar");
        return result(reply, "similar", tracks);
      }

      if (intent === "lyrics") {
        if (!title) return result("Avvia un brano e ti mostro il testo.", "lyrics");
        const lyrics = await getTrackLyrics({ data: { title, artist } });
        if (!lyrics.lines.length) return result("Non ho trovato il testo di questo brano.", "lyrics");
        const snippet = lyrics.lines
          .map((l) => l.text)
          .filter(Boolean)
          .slice(0, 8)
          .join("\n");
        return result(snippet ? `${reply}\n\n${snippet}` : reply, "lyrics");
      }

      if (intent === "radio") {
        let radios: RadioStation[] = [];
        if (query) {
          const found = await searchCatalog({ data: { q: query } });
          radios = found.radios || [];
        }
        if (!radios.length) radios = await getTopRadios();
        if (!radios.length) return result("Nessuna radio disponibile al momento.", "radio");
        return result(reply, "radio", [], radios);
      }

      if (intent === "mood") {
        const mood = query || message;
        const mix = await createMoodMix({ data: { mood, prompt: mood } });
        if (!mix.tracks.length) return result("Non sono riuscito a creare il mix. Prova un altro mood.", "mood");
        return result(grok?.reply || mix.blurb || reply, "mood", mix.tracks);
      }

      return result(reply, intent);
    } catch {
      return result("Qualcosa è andato storto. Riprova tra un attimo.", intent);
    }
  });
