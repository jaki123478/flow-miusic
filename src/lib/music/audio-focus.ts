type SessionType = "auto" | "playback" | "transient" | "transient-solo" | "ambient" | "play-and-record";
type SessionState = "active" | "interrupted" | "inactive";

type AudioSessionLike = EventTarget & {
  type: SessionType;
  readonly state: SessionState;
};

function getSession(): AudioSessionLike | null {
  if (typeof navigator === "undefined") return null;
  const session = (navigator as Navigator & { audioSession?: AudioSessionLike }).audioSession;
  return session ?? null;
}

let lost = false;
let resumeWhenFree = false;

export function audioFocusLost() {
  return lost;
}

export function claimAudioFocus() {
  const session = getSession();
  if (!session) return;
  try {
    session.type = "playback";
  } catch {
    /* unsupported */
  }
}

export function bindAudioFocus(handlers: { onLost: () => void; onGained: () => void }) {
  claimAudioFocus();
  const session = getSession();
  const onState = () => {
    const state = session?.state || (lost ? "interrupted" : "active");
    const locked = typeof document !== "undefined" && document.hidden;
    if (state === "interrupted" || state === "inactive") {
      if (lost) return;
      if (locked) {
        claimAudioFocus();
        return;
      }
      lost = true;
      handlers.onLost();
      return;
    }
    if (state === "active" && lost) {
      lost = false;
      handlers.onGained();
    }
  };
  session?.addEventListener("statechange", onState);
  return () => {
    session?.removeEventListener("statechange", onState);
  };
}

export function markPlayingForFocus(playing: boolean) {
  if (playing) {
    claimAudioFocus();
    resumeWhenFree = true;
  } else if (!lost) {
    resumeWhenFree = false;
  }
}

export function shouldResumeAfterFocus() {
  return resumeWhenFree;
}
