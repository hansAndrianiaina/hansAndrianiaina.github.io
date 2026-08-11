// src/components/SoundPlayer.tsx
// Reusable sound effect player component

import { useEffect, useRef, useCallback } from 'react';
import { preloadSound, playSound, stopSound, resumeAudioContext } from '../utils/audio';

// interface SoundPlayerProps {
//   /** Sound file URL (relative to public folder or absolute) */
//   src: string;
//   /** Whether to preload on mount (recommended for instant playback) */
//   preload?: boolean;
//   /** Volume 0-1 */
//   volume?: number;
//   /** Whether to loop */
//   loop?: boolean;
//   /** Fade in duration in seconds */
//   fadeIn?: number;
//   /** Called when sound finishes (non-looping) */
//   onEnded?: () => void;
// }

// /**
//  * Simple sound player component.
//  * Usage: <SoundPlayer src="/sounds/click.mp3" onClick={() => play()} />
//  *
//  * Call ref.current.play() to trigger playback.
//  * Must be triggered by user interaction (click, keydown) due to autoplay policy.
//  */
// export function SoundPlayer({
//   src,
//   preload = true,
//   volume = 1,
//   loop = false,
//   fadeIn = 0,
//   onEnded,
// }: SoundPlayerProps) {
//   const playbackIdRef = useRef<string | null>(null);
//   const endedCallbackRef = useRef(onEnded);

//   // Keep callback ref updated
//   useEffect(() => {
//     endedCallbackRef.current = onEnded;
//   }, [onEnded]);

//   // Preload on mount
//   useEffect(() => {
//     if (preload) {
//       preloadSound(src).catch((err) => console.warn(`Failed to preload sound: ${src}`, err));
//     }
//   }, [src, preload]);

//   const play = useCallback(async () => {
//     // Resume AudioContext within user gesture context
//     await resumeAudioContext();

//     // Stop any currently playing instance
//     if (playbackIdRef.current) {
//       stopSound(playbackIdRef.current, 0);
//     }

//     // Play new instance
//     playbackIdRef.current = playSound(src, { loop, volume, fadeIn });

//     // Handle onEnded for non-looping sounds
//     if (!loop && onEnded) {
//       // We can't easily detect when a Web Audio source ends without an AnalyserNode
//       // For simplicity, we'll use a timeout based on buffer duration if available
//       // A more robust solution would use an OfflineAudioContext or AnalyserNode
//     }
//   }, [src, loop, volume, fadeIn]);

//   const stop = useCallback((fadeOut = 0.5) => {
//     if (playbackIdRef.current) {
//       stopSound(playbackIdRef.current, fadeOut);
//       playbackIdRef.current = null;
//     }
//   }, []);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (playbackIdRef.current) {
//         stopSound(playbackIdRef.current, 0);
//       }
//     };
//   }, []);

//   // Return imperative API via ref
//   return null; // This component doesn't render anything
// }

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