import type { Track } from './types';
import { catalogStreamUrl } from './stream-url';
import { getGlobalAudio, isPlaybackFrozen, unlockAudioSession } from './native-audio';

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /iP(hone|ad|od)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function safeCall(fn: () => void) {
  try { fn(); } catch (_) {}
}

export type PlayerRepeatMode = 'off' | 'one' | 'all';

export interface BackgroundAudioOptions {
  repeat?: PlayerRepeatMode;
  seekStep?: number;
  crossOrigin?: 'anonymous' | 'use-credentials';
  onChange?: (state: {
    playing: boolean;
    index: number;
    track: Track | null;
    currentTime: number;
    duration: number;
    unlocked: boolean;
  }) => void;
  onError?: (err: { code: number | string; message: string; src?: string }) => void;
  onTrackEnded?: () => void;
}

export class BackgroundAudioPlayer {
  queue: Track[] = [];
  index: number = 0;
  repeat: PlayerRepeatMode = 'off';
  seekStep: number = 10;
  onChange: NonNullable<BackgroundAudioOptions['onChange']> = () => {};
  onError: NonNullable<BackgroundAudioOptions['onError']> = () => {};
  onTrackEnded?: () => void;
  private _unlocked = false;
  private _wantPlay = false;
  private _ios = isIOS();
  public audio: HTMLAudioElement;

  constructor(options: BackgroundAudioOptions = {}) {
    this.repeat = options.repeat || 'off';
    this.seekStep = options.seekStep || 10;
    this.onChange = options.onChange || (() => {});
    this.onError = options.onError || (() => {});
    this.onTrackEnded = options.onTrackEnded;

    if (typeof document !== 'undefined') {
      this.audio = getGlobalAudio() as HTMLAudioElement;
      if (this.audio) {
        this.audio.preload = 'auto';
        this.audio.crossOrigin = options.crossOrigin || 'anonymous';
        this.audio.setAttribute('controlslist', 'nodownload');
      }
      this._bindAudioEvents();
      this._configureAudioSession();
      this._bindMediaSession();
      this._bindLifecycle();
    } else {
      this.audio = null as any;
    }
  }

  private _configureAudioSession() {
    unlockAudioSession();
  }

  private _getTrackSrc(track: Track): string {
    if (track.source === "radio" && track.streamUrl) return track.streamUrl;
    if (track.videoId) return catalogStreamUrl(track.videoId);
    return track.streamUrl || "";
  }

  private _bindAudioEvents() {
    const a = this.audio;
    if (!a) return;

    a.addEventListener('play', () => {
      this._wantPlay = true;
      this._setPlaybackState('playing');
      this._publish();
    });

    a.addEventListener('pause', () => {
      if (!this._wantPlay) {
        this._setPlaybackState('paused');
      }
      this._publish();
    });

    a.addEventListener('timeupdate', () => {
      this._updatePositionState();
    });

    a.addEventListener('durationchange', () => {
      this._updatePositionState();
    });

    a.addEventListener('waiting', () => {
      this._setPlaybackState('playing');
    });

    a.addEventListener('playing', () => {
      this._setPlaybackState('playing');
      this._publish();
    });

    a.addEventListener('error', () => {
      const err = a.error;
      this.onError({
        code: err ? err.code : 0,
        message: err ? err.message : 'audio error',
        src: a.currentSrc,
      });
      if (this.queue.length > 1) {
        this.next({ fromError: true });
      }
    });

    /**
     * CRITICO iOS: il brano successivo va avviato qui in modo sincrono.
     */
    a.addEventListener('ended', () => {
      if (this.repeat === 'one') {
        a.currentTime = 0;
        const p = a.play();
        if (p && p.catch) p.catch(() => {});
        return;
      }
      if (this.onTrackEnded) {
        this.onTrackEnded();
      } else {
        this.next({ fromEnded: true });
      }
    });
  }

  private _bindLifecycle() {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      this._configureAudioSession();
      if (!document.hidden && this._wantPlay && this.audio && this.audio.paused) {
        const p = this.audio.play();
        if (p && p.catch) p.catch(() => {});
      }
    });

    window.addEventListener('pageshow', () => {
      this._configureAudioSession();
      if (this._wantPlay && this.audio && this.audio.paused) {
        const p = this.audio.play();
        if (p && p.catch) p.catch(() => {});
      }
    });

    window.addEventListener('focus', () => {
      this._configureAudioSession();
    });
  }

  private _bindMediaSession() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const handlers: Record<string, (d?: any) => void> = {
      play: () => { void this.play(); },
      pause: () => { this.pause(); },
      stop: () => { this.stop(); },
      previoustrack: () => { this.prev(); },
      nexttrack: () => { this.next(); },
      seekbackward: (d) => {
        this.seekRelative(-(d && d.seekOffset ? d.seekOffset : this.seekStep));
      },
      seekforward: (d) => {
        this.seekRelative(d && d.seekOffset ? d.seekOffset : this.seekStep);
      },
      seekto: (d) => {
        if (d && typeof d.seekTime === 'number') this.seek(d.seekTime);
      },
    };

    Object.keys(handlers).forEach((action) => {
      safeCall(() => {
        navigator.mediaSession.setActionHandler(action as any, handlers[action]);
      });
    });
  }

  private _setPlaybackState(state: 'none' | 'paused' | 'playing') {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch (_) {}
  }

  private _updatePositionState() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return;
    const a = this.audio;
    if (!a || !Number.isFinite(a.duration) || a.duration <= 0) return;
    try {
      navigator.mediaSession.setPositionState({
        duration: a.duration,
        playbackRate: a.playbackRate || 1,
        position: Math.min(a.currentTime, a.duration),
      });
    } catch (_) {}
  }

  private _applyMetadata(track: Track) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || !track) return;

    const artwork: MediaImage[] = [];
    if (typeof track.artwork === 'string' && track.artwork) {
      artwork.push(
        { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
        { src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
        { src: track.artwork, sizes: '512x512', type: 'image/jpeg' }
      );
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'In riproduzione',
        artist: track.artist || '',
        album: track.album || '',
        artwork,
      });
    } catch (_) {}
  }

  private _publish() {
    const track = this.currentTrack();
    this.onChange({
      playing: !this.audio?.paused,
      index: this.index,
      track,
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio?.duration || 0,
      unlocked: this._unlocked,
    });
  }

  public unlock(): Promise<boolean> {
    this._configureAudioSession();
    this._unlocked = true;
    return Promise.resolve(true);
  }

  public setQueue(tracks: Track[], startIndex = 0) {
    this.queue = Array.isArray(tracks) ? tracks.slice() : [];
    this.index = Math.max(0, Math.min(startIndex || 0, Math.max(this.queue.length - 1, 0)));
    if (this.queue.length) this._load(this.queue[this.index], false);
    this._publish();
  }

  public currentTrack(): Track | null {
    return this.queue[this.index] || null;
  }

  private _load(track: Track | undefined, autoplay: boolean) {
    if (!track) return;
    const src = this._getTrackSrc(track);
    if (!src || !this.audio) return;

    this._configureAudioSession();
    this._applyMetadata(track);

    if (isPlaybackFrozen()) {
      if (autoplay && this.audio.paused) {
        const p = this.audio.play();
        if (p && p.catch) p.catch(() => {});
      }
      return;
    }

    this.audio.src = src;

    if (autoplay) {
      const p = this.audio.play();
      if (p && p.catch) {
        p.catch((err) => {
          this.onError({ code: 'play_rejected', message: String(err?.message || err), src });
        });
      }
    }
  }

  public play(): Promise<void> {
    this._configureAudioSession();
    this._wantPlay = true;

    const track = this.currentTrack();
    if (!track) return Promise.reject(new Error('Nessun brano in coda'));

    if (!this.audio.src) this._load(track, false);
    this._applyMetadata(track);
    this._setPlaybackState('playing');

    const p = this.audio.play();
    if (p) {
      return p.catch((err) => {
        this._wantPlay = false;
        this._setPlaybackState("paused");
        this.onError({ code: "play_rejected", message: String(err?.message || err) });
        throw err;
      });
    }
    return Promise.resolve();
  }

  public pause() {
    this._wantPlay = false;
    if (this.audio) this.audio.pause();
    this._setPlaybackState('paused');
    this._publish();
  }

  public toggle(): Promise<void> {
    return this.audio?.paused ? this.play() : (this.pause(), Promise.resolve());
  }

  public stop() {
    this._wantPlay = false;
    if (this.audio) {
      this.audio.pause();
      try { this.audio.currentTime = 0; } catch (_) {}
    }
    this._setPlaybackState('none');
    this._publish();
  }

  public seek(seconds: number) {
    if (!Number.isFinite(seconds) || !this.audio) return;
    const d = this.audio.duration;
    let t = seconds;
    if (Number.isFinite(d)) t = Math.max(0, Math.min(seconds, d));
    try { this.audio.currentTime = t; } catch (_) {}
    this._updatePositionState();
  }

  public seekRelative(delta: number) {
    if (this.audio) this.seek((this.audio.currentTime || 0) + delta);
  }

  public setVolume(v: number) {
    if (this.audio) this.audio.volume = Math.max(0, Math.min(1, v));
  }

  public setPlaybackRate(rate: number) {
    if (this.audio) {
      this.audio.playbackRate = rate;
      this._updatePositionState();
    }
  }

  public next(meta?: { fromEnded?: boolean; fromError?: boolean }) {
    if (!this.queue.length) return;
    const fromEnded = meta?.fromEnded;

    if (this.index < this.queue.length - 1) {
      this.index += 1;
    } else if (this.repeat === 'all') {
      this.index = 0;
    } else if (fromEnded) {
      this._wantPlay = false;
      this._setPlaybackState('none');
      this._publish();
      return;
    } else {
      return;
    }

    this._load(this.queue[this.index], true);
    this._publish();
  }

  public prev() {
    if (!this.queue.length) return;
    if ((this.audio?.currentTime || 0) > 3) {
      this.seek(0);
      return;
    }
    this.index = this.index > 0 ? this.index - 1 : (this.repeat === 'all' ? this.queue.length - 1 : 0);
    this._load(this.queue[this.index], true);
    this._publish();
  }

  public destroy() {
    this.stop();
  }
}

// Global Singleton instance for web app
let globalPlayer: BackgroundAudioPlayer | null = null;

export function getBackgroundPlayer(): BackgroundAudioPlayer {
  if (!globalPlayer && typeof window !== 'undefined') {
    globalPlayer = new BackgroundAudioPlayer();
  }
  return globalPlayer as BackgroundAudioPlayer;
}
