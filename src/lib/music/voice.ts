type VoiceLang = "it" | "en";
type SpeakOpts = { onStart?: () => void; onEnd?: () => void };
type ListenHandlers = {
  onPartial?: (t: string) => void;
  onFinal: (t: string) => void;
  onError?: (msg: string) => void;
  onEnd?: () => void;
};

type RecResult = { isFinal: boolean; 0?: { transcript?: string } };
type RecEvent = { resultIndex: number; results: ArrayLike<RecResult> };
type RecError = { error?: string };
type RecLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: RecEvent) => void) | null;
  onerror: ((ev: RecError) => void) | null;
  onend: (() => void) | null;
};

let speakToken = 0;

function hasLetters(text: string): boolean {
  return /[\p{L}]/u.test(text);
}

function takeTwoSentences(text: string): string {
  const found: string[] = [];
  const re = /[^.!?…]+(?:[.!?…]+|(?=$))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const piece = m[0].trim();
    if (!piece) continue;
    found.push(piece);
    if (found.length >= 2) break;
  }
  return (found.join(" ") || text).trim();
}

function collapseWs(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function speakable(text: string): string {
  const src = (text || "").replace(/\r/g, "").trim();
  if (!src) return "";
  const letters = hasLetters(src);
  const head = src.split(/\n\s*\n/, 1)[0] ?? src;
  const base = collapseWs(head) || (letters ? collapseWs(src) : "");
  let out = takeTwoSentences(base);
  if (out.length > 280) out = out.slice(0, 280).trim();
  if (!out && letters) out = collapseWs(src).slice(0, 280);
  return out;
}

function getSynth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

export function stopSpeaking(): void {
  speakToken += 1;
  getSynth()?.cancel();
}

export function isSpeaking(): boolean {
  return Boolean(getSynth()?.speaking);
}

function waitVoices(synth: SpeechSynthesis): Promise<SpeechSynthesisVoice[]> {
  const have = synth.getVoices();
  if (have.length) return Promise.resolve(have);
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener("voiceschanged", finish);
      window.clearTimeout(timer);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", finish);
    const timer = window.setTimeout(finish, 1500);
  });
}

function pickVoice(voices: SpeechSynthesisVoice[], lang: VoiceLang): SpeechSynthesisVoice | undefined {
  const prefix = lang === "it" ? "it" : "en";
  const exact = lang === "it" ? "it-it" : "en-us";
  const match = voices.filter((v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix));
  if (!match.length) return undefined;
  const score = (v: SpeechSynthesisVoice) => {
    const code = v.lang.replace("_", "-").toLowerCase();
    const name = v.name.toLowerCase();
    let n = 1;
    if (code === exact || code.startsWith(`${exact}-`)) n += 2;
    if (name.includes("google") || name.includes("microsoft")) n += 4;
    if (name.includes("neural") || name.includes("natural")) n += 3;
    return n;
  };
  return [...match].sort((a, b) => score(b) - score(a))[0];
}

export function speakDj(text: string, lang: VoiceLang, opts?: SpeakOpts): void {
  const synth = getSynth();
  if (!synth) {
    opts?.onEnd?.();
    return;
  }
  synth.cancel();
  const spoken = speakable(text);
  const token = (speakToken += 1);
  if (!spoken) {
    opts?.onEnd?.();
    return;
  }
  let ended = false;
  const end = () => {
    if (ended) return;
    ended = true;
    opts?.onEnd?.();
  };
  void waitVoices(synth).then((voices) => {
    if (token !== speakToken) {
      end();
      return;
    }
    const utt = new SpeechSynthesisUtterance(spoken);
    utt.lang = lang === "it" ? "it-IT" : "en-US";
    utt.rate = lang === "it" ? 1.02 : 1;
    utt.pitch = 1;
    const voice = pickVoice(voices, lang);
    if (voice) utt.voice = voice;
    utt.onstart = () => {
      if (ended || token !== speakToken) return;
      opts?.onStart?.();
    };
    utt.onend = end;
    utt.onerror = end;
    window.setTimeout(() => {
      if (token !== speakToken) {
        end();
        return;
      }
      try {
        synth.speak(utt);
      } catch {
        end();
      }
    }, 40);
  });
}

function recognitionCtor(): (new () => RecLike) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: new () => RecLike;
    webkitSpeechRecognition?: new () => RecLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

export function canListen(): boolean {
  return Boolean(recognitionCtor());
}

export function startListening(lang: VoiceLang, handlers: ListenHandlers): () => void {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    handlers.onEnd?.();
    return () => {};
  }
  const rec = new Ctor();
  rec.lang = lang === "it" ? "it-IT" : "en-US";
  rec.interimResults = true;
  rec.continuous = false;
  let finals = "";
  let stopped = false;
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    if (finals) handlers.onFinal(finals);
    handlers.onEnd?.();
  };

  rec.onresult = (ev) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const res = ev.results[i];
      const t = (res?.[0]?.transcript || "").trim();
      if (!t) continue;
      if (res.isFinal) finals = `${finals} ${t}`.trim();
      else interim = `${interim} ${t}`.trim();
    }
    const live = `${finals} ${interim}`.trim();
    if (live) handlers.onPartial?.(live);
  };

  rec.onerror = (ev) => {
    const err = ev.error || "";
    if (err === "no-speech" || err === "aborted") return;
    if (err === "not-allowed") {
      handlers.onError?.("Microfono bloccato");
      return;
    }
    handlers.onError?.(err);
  };

  rec.onend = close;

  try {
    rec.start();
  } catch {
    close();
    return () => {};
  }

  return () => {
    if (stopped) return;
    stopped = true;
    try {
      rec.stop();
    } catch {
      close();
    }
  };
}
