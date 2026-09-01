import type { Track } from './types';

export function getGlobalAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  if (!w.__FLOW_AUDIO__) {
    const el = document.createElement('audio');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', 'true');
    el.preload = 'auto';
    el.crossOrigin = 'anonymous';
    el.style.position = 'fixed';
    el.style.bottom = '0';
    el.style.left = '0';
    el.style.width = '10px';
    el.style.height = '10px';
    el.style.zIndex = '-1';
    el.style.pointerEvents = 'none';
    document.documentElement.appendChild(el);
    w.__FLOW_AUDIO__ = el;
  }
  return w.__FLOW_AUDIO__;
}

export function directPlayTrack(track: Track) {
  if (typeof window === 'undefined' || !track) return;
  try {
    if ((navigator as any).audioSession) {
      (navigator as any).audioSession.type = 'playback';
    }
  } catch (_) {}

  const audio = getGlobalAudio();
  if (audio) {
    const host = window.location.hostname;
    const base = host.includes('web.app') || host.includes('firebaseapp.com') ? 'https://flow-music-app-two.vercel.app' : '';
    const src = track.streamUrl || (track.videoId ? `${base}/api/stream?v=${track.videoId}` : "");
    if (src) {
      audio.src = src;
      audio.load();
      void audio.play().catch(() => {});
    }
  }
}
