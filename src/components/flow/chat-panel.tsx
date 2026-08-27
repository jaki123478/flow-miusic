import { useEffect, useRef, useState } from "react";
import { Bot, Heart, Mic, Pause, Radio, Send, SkipForward, Sparkles, Volume2, VolumeOff, X } from "lucide-react";
import { chatTurn, type ChatResult } from "@/lib/music/assistant";
import { stationToTrack } from "@/lib/music/catalog";
import type { Track } from "@/lib/music/types";
import { canListen, speakable, speakDj, startListening, stopSpeaking } from "@/lib/music/voice";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/stores/flow-store";
import { TrackArt, TrackRow } from "./tracks";

const CHIPS = ["Suona qualcosa di simile", "Radio Italia", "Testi", "Mix focus", "Party", "Chill"] as const;

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  tracks?: Track[];
  radios?: ChatResult["radios"];
};

function uid() {
  return `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function applyChatResult(result: ChatResult) {
  const s = useFlowStore.getState();
  switch (result.intent) {
    case "skip":
      s.next();
      break;
    case "pause":
      s.pause();
      break;
    case "resume":
      s.resume();
      break;
    case "love":
      if (s.current) s.toggleLike(s.current);
      break;
    case "play":
    case "search":
    case "similar":
    case "mood":
      if (result.tracks?.length) s.playQueue(result.tracks);
      break;
    case "queue":
      for (const track of result.tracks ?? []) s.addToQueue(track);
      break;
    case "radio": {
      const first = result.radios?.[0];
      if (first) s.playTrack(stationToTrack(first));
      break;
    }
    default:
      break;
  }
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2" aria-live="polite" aria-label="Flow DJ sta scrivendo">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-primary">
        <Bot className="size-4" />
      </span>
      <div className="flex h-10 items-center gap-1 rounded-2xl bg-elevated px-3">
        <span className="size-2 animate-bounce rounded-full bg-muted" />
        <span className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: "0.12s" }} />
        <span className="size-2 animate-bounce rounded-full bg-muted" style={{ animationDelay: "0.24s" }} />
      </div>
    </div>
  );
}

export function ChatPanel() {
  const showChat = useFlowStore((s) => s.showChat);
  const setShowChat = useFlowStore((s) => s.setShowChat);
  const current = useFlowStore((s) => s.current);
  const isPlaying = useFlowStore((s) => s.isPlaying);
  const playTrack = useFlowStore((s) => s.playTrack);
  const next = useFlowStore((s) => s.next);
  const pause = useFlowStore((s) => s.pause);
  const toggleLike = useFlowStore((s) => s.toggleLike);
  const notify = useFlowStore((s) => s.notify);
  const liked = useFlowStore((s) => (s.current ? s.liked.some((t) => t.id === s.current!.id) : false));
  const voiceOn = useFlowStore((s) => s.settings.voiceOn);
  const locale = useFlowStore((s) => s.settings.locale);
  const patchSettings = useFlowStore((s) => s.patchSettings);
  const setVoiceDuck = useFlowStore((s) => s.setVoiceDuck);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const busyRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const stopListenRef = useRef<(() => void) | null>(null);
  const listenLiveRef = useRef(false);

  const lang = locale === "en" ? "en" : "it";
  const micOk = canListen();

  const haltSpeech = () => {
    stopSpeaking();
    setVoiceDuck(false);
  };

  const haltListen = () => {
    listenLiveRef.current = false;
    stopListenRef.current?.();
    stopListenRef.current = null;
    setListening(false);
    setHeard("");
  };

  const talk = (text: string) => {
    if (!useFlowStore.getState().settings.voiceOn) return;
    speakDj(speakable(text), lang, {
      onStart: () => setVoiceDuck(true),
      onEnd: () => setVoiceDuck(false),
    });
  };

  useEffect(() => {
    if (showChat && !voiceOn) inputRef.current?.focus();
  }, [showChat, voiceOn]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy]);

  useEffect(() => {
    return () => {
      stopListenRef.current?.();
      stopListenRef.current = null;
      listenLiveRef.current = false;
      stopSpeaking();
      useFlowStore.getState().setVoiceDuck(false);
    };
  }, []);

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busyRef.current) return;
    haltListen();
    haltSpeech();
    busyRef.current = true;
    setBusy(true);
    setDraft("");
    setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
    try {
      const state = useFlowStore.getState();
      const history = messages
        .slice(-8)
        .map((m) => ({ role: m.role, text: m.text }));
      const result = await chatTurn({
        data: {
          message: text,
          title: state.current?.title,
          artist: state.current?.artist,
          history,
        },
      });
      applyChatResult(result);
      const reply = result.reply?.trim() || "Ecco cosa ho trovato.";
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: "assistant",
          text: reply,
          tracks: result.tracks,
          radios: result.radios,
        },
      ]);
      talk(reply);
    } catch {
      notify("Non riesco a rispondere ora");
      const reply = "Qualcosa è andato storto. Riprova tra un attimo.";
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", text: reply },
      ]);
      talk(reply);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const toggleVoice = () => {
    if (voiceOn) {
      patchSettings({ voiceOn: false });
      haltSpeech();
      return;
    }
    patchSettings({ voiceOn: true });
    const intro =
      lang === "en"
        ? "Hi, I'm Flow DJ. What should we play?"
        : "Ciao, sono Flow DJ. Dimmi cosa vuoi ascoltare.";
    speakDj(speakable(intro), lang, {
      onStart: () => setVoiceDuck(true),
      onEnd: () => setVoiceDuck(false),
    });
  };

  const onMic = () => {
    if (!micOk || busyRef.current) return;
    if (listening) {
      haltListen();
      return;
    }
    haltSpeech();
    listenLiveRef.current = true;
    setListening(true);
    setHeard("");
    try {
      stopListenRef.current = startListening(lang, {
        onPartial: (text: string) => {
          setHeard(text);
          setDraft(text);
        },
        onFinal: (text: string) => {
          if (!listenLiveRef.current) return;
          setHeard(text);
          setDraft(text);
          void send(text);
        },
        onError: (msg: string) => notify(msg),
        onEnd: () => {
          listenLiveRef.current = false;
          stopListenRef.current = null;
          setListening(false);
          setHeard("");
        },
      });
    } catch {
      listenLiveRef.current = false;
      setListening(false);
      setHeard("");
    }
  };

  const closeChat = () => {
    haltListen();
    haltSpeech();
    setShowChat(false);
  };

  const empty = messages.length === 0;
  const placeholder = listening
    ? heard || (lang === "en" ? "Listening…" : "Ti ascolto…")
    : "Chiedi un brano, un mood…";

  return (
    <section
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-surface",
      )}
      aria-label="Flow DJ"
    >
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:pt-2">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-elevated">
          <Sparkles className="size-5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold">Flow DJ</h2>
          <p className="truncate text-xs text-muted">Parla o scrivi: brani, mood, testi</p>
        </div>
        <button
          type="button"
          onClick={toggleVoice}
          className={cn(
            "pressable flex size-11 shrink-0 items-center justify-center rounded-full hover:text-fg",
            voiceOn ? "text-primary" : "text-muted",
          )}
          aria-label="Attiva voce"
          aria-pressed={voiceOn}
        >
          {voiceOn ? <Volume2 className="size-5" /> : <VolumeOff className="size-5" />}
        </button>
        <button
          type="button"
          onClick={closeChat}
          className="pressable flex size-11 shrink-0 items-center justify-center rounded-full text-muted hover:text-fg"
          aria-label="Chiudi"
        >
          <X className="size-5" />
        </button>
      </header>

      {current ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
          <span className="size-10 shrink-0 overflow-hidden rounded-md bg-elevated">
            <TrackArt src={current.artwork} alt="" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{current.title}</p>
            <p className="truncate text-xs text-muted">{current.artist}</p>
          </div>
          {isPlaying ? (
            <button
              type="button"
              onClick={() => pause()}
              className="pressable flex size-10 shrink-0 items-center justify-center rounded-full text-fg"
              aria-label="Pausa"
            >
              <Pause className="size-4 fill-current" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => next()}
            className="pressable flex size-10 shrink-0 items-center justify-center rounded-full text-fg"
            aria-label="Brano successivo"
          >
            <SkipForward className="size-4 fill-current" />
          </button>
          <button
            type="button"
            onClick={() => toggleLike(current)}
            className={cn(
              "pressable flex size-10 shrink-0 items-center justify-center rounded-full",
              liked ? "text-primary" : "text-muted",
            )}
            aria-label={liked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          >
            <Heart className={cn("heart-icon size-4", liked && "is-on fill-current")} />
          </button>
        </div>
      ) : null}

      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4">
        {empty ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-primary">
                <Bot className="size-4" />
              </span>
              <p className="rounded-2xl bg-elevated px-3 py-2.5 text-sm leading-relaxed">
                Ciao. Dimmi un artista, un mood o cosa sta suonando.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => void send(chip)}
                  className="chip min-h-10 rounded-full bg-elevated px-3 text-sm font-medium ring-1 ring-border"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl bg-primary px-3 py-2 text-sm leading-relaxed text-primary-fg">
                    {msg.text}
                  </p>
                </div>
              ) : (
                <div key={msg.id} className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-elevated text-primary">
                      <Bot className="size-4" />
                    </span>
                    <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-elevated px-3 py-2 text-sm leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  {msg.tracks?.length ? (
                    <div className="ml-10">
                      {msg.tracks.map((track) => (
                        <TrackRow key={track.id} track={track} queue={msg.tracks} />
                      ))}
                    </div>
                  ) : null}
                  {msg.radios?.length ? (
                    <div className="ml-10 flex flex-col gap-1">
                      {msg.radios.map((station) => (
                        <button
                          key={station.id}
                          type="button"
                          onClick={() => playTrack(stationToTrack(station))}
                          className="pressable flex min-h-10 items-center gap-2 rounded-lg bg-elevated px-2 py-1.5 text-left hover:bg-highlight"
                        >
                          <span className="size-8 shrink-0 overflow-hidden rounded-md bg-surface">
                            <TrackArt src={station.artwork} alt="" />
                          </span>
                          <Radio className="size-3.5 shrink-0 text-primary" />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{station.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ),
            )}
            {busy ? <TypingDots /> : null}
            <div ref={endRef} />
          </div>
        )}
        {empty && busy ? (
          <div className="mt-4">
            <TypingDots />
          </div>
        ) : null}
      </div>

      <form
        className="flex shrink-0 items-center gap-2 border-t border-border px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="send"
          disabled={busy}
          className="h-11 min-w-0 flex-1 rounded-lg bg-elevated px-3 text-base outline-none ring-1 ring-border placeholder:text-subtle disabled:opacity-60"
          aria-label="Messaggio per Flow DJ"
        />
        <button
          type="button"
          onClick={onMic}
          disabled={!micOk || busy}
          className={cn(
            "pressable flex size-11 shrink-0 items-center justify-center rounded-full disabled:opacity-40",
            listening ? "animate-pulse bg-primary text-primary-fg" : "text-muted hover:text-fg",
          )}
          aria-label="Parla"
          aria-pressed={listening}
        >
          <Mic className="size-4" />
        </button>
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="pressable flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-fg disabled:opacity-40"
          aria-label="Invia"
        >
          <Send className="size-4" />
        </button>
      </form>
    </section>
  );
}
