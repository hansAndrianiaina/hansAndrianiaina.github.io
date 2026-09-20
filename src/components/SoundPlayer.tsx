// src/components/SoundPlayer.tsx
// Reusable sound effect player component

import { useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { preloadSound, playSound, stopSound, resumeAudioContext } from '../utils/audio';


// Hook version for easier use in functional components
export function useSoundPlayer(src: string, options: { preload?: boolean; volume?: number; loop?: boolean; fadeIn?: number } = {}) {
  const { preload = true, volume = 1, loop = false, fadeIn = 0 } = options;
  const playbackIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (preload) {
      preloadSound(src).catch((err) => console.warn(`Failed to preload sound: ${src}`, err));
    }
  }, [src, preload]);

  const play = useCallback(async () => {
    await resumeAudioContext();
    if (playbackIdRef.current) {
      stopSound(playbackIdRef.current, 0);
    }
    playbackIdRef.current = playSound(src, { loop, volume, fadeIn });
  }, [src, loop, volume, fadeIn]);

  const stop = useCallback((fadeOut = 0.5) => {
    if (playbackIdRef.current) {
      stopSound(playbackIdRef.current, fadeOut);
      playbackIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (playbackIdRef.current) {
        stopSound(playbackIdRef.current, 0);
      }
    };
  }, []);

  return { play, stop };
}

import { musicManager } from '../utils/music'

export function useBackgroundMusic() {
  const state = useSyncExternalStore(musicManager.subscribe, musicManager.getState)
  return {
    ...state, // volume, src, isPlaying
    play: musicManager.play,
    toggle: musicManager.toggle,
    setVolume: musicManager.setVolume,
  }
}