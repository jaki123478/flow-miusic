import { useFlowStore } from '@/stores/flow-store';
import type { Track } from './types';

export function isAndroidNative(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).FlowNative);
}

export function notifyNativeTrackChange(track: Track, isPlaying: boolean, currentTimeSecs: number) {
  if (typeof window === 'undefined') return;
  const bridge = (window as any).FlowNative;
  if (!bridge) return;

  try {
    bridge.updateTrack(
      track.title || 'Flow Music',
      track.artist || 'Artista sconosciuto',
      track.artwork || '',
      isPlaying,
      Math.floor(currentTimeSecs || 0),
      Math.floor(track.duration || 0)
    );
  } catch (err) {
    console.warn('[FlowNative] updateTrack error:', err);
  }
}

export function notifyNativeLyricLine(lyricText: string, songTitle: string) {
  if (typeof window === 'undefined') return;
  const bridge = (window as any).FlowNative;
  if (!bridge) return;

  try {
    bridge.updateFloatingLyric(lyricText || '', songTitle || 'Flow Music');
  } catch (err) {
    console.warn('[FlowNative] updateFloatingLyric error:', err);
  }
}

export function setNativeFloatingLyrics(enable: boolean) {
  const bridge = (window as any)?.FlowNative;
  if (bridge?.toggleFloatingLyrics) {
    bridge.toggleFloatingLyrics(enable);
  }
}

export function setNativeBassBoost(enable: boolean, percent: number) {
  const bridge = (window as any)?.FlowNative;
  if (bridge?.setHardwareBassBoost) {
    bridge.setHardwareBassBoost(enable, percent);
  }
}

export function setNativeVirtualizer(enable: boolean, percent: number) {
  const bridge = (window as any)?.FlowNative;
  if (bridge?.setHardwareVirtualizer) {
    bridge.setHardwareVirtualizer(enable, percent);
  }
}

export function setNativeShakeToSkip(enable: boolean) {
  const bridge = (window as any)?.FlowNative;
  if (bridge?.setShakeToSkipEnabled) {
    bridge.setShakeToSkipEnabled(enable);
  }
}

export function setNativeAirGestures(enable: boolean) {
  const bridge = (window as any)?.FlowNative;
  if (bridge?.setAirGesturesEnabled) {
    bridge.setAirGesturesEnabled(enable);
  }
}

export function downloadNativeTrackToStorage(track: Track, streamUrl: string) {
  const bridge = (window as any)?.FlowNative;
  if (bridge?.downloadToMusicFolder) {
    bridge.downloadToMusicFolder(track.title, track.artist, streamUrl, 'm4a');
  }
}

// Global receiver for native commands (from Notification, Widget, Lockscreen, Headset, Shake)
if (typeof window !== 'undefined') {
  (window as any).__FLOW_DISPATCH_ACTION__ = (action: string) => {
    const s = useFlowStore.getState();
    switch (action) {
      case 'play':
        s.resume();
        break;
      case 'pause':
        s.pause();
        break;
      case 'toggle':
        s.togglePlay();
        break;
      case 'next':
        s.next();
        break;
      case 'prev':
        s.prev();
        break;
    }
  };

  (window as any).__FLOW_DISPATCH_SEEK__ = (positionSecs: number) => {
    useFlowStore.getState().seek(positionSecs);
  };
}
