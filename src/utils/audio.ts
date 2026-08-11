// src/utils/audio.ts
// Simple Web Audio API wrapper for ambient sound management

let audioContext: AudioContext | null = null;
const soundBuffers = new Map<string, AudioBuffer>();
const playingSources = new Map<string, { source: AudioBufferSourceNode; gain: GainNode }>();

/**
 * Get or create the global AudioContext
 * Must be called after user interaction due to autoplay policy
 */
export function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  // Resume if suspended (autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * Preload an audio file and decode it to an AudioBuffer
 * Call this early (e.g., on component mount) BEFORE user interaction
 * so the buffer is ready for instant playback on user gesture
 */
export async function preloadSound(url: string): Promise<AudioBuffer> {
  if (soundBuffers.has(url)) {
    return soundBuffers.get(url)!;
  }

  const ctx = getAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  soundBuffers.set(url, audioBuffer);
  return audioBuffer;
}

/**
 * Load an audio file and decode it to an AudioBuffer
 * Caches the buffer for reuse
 * @deprecated Use preloadSound() for better autoplay handling
 */
export async function loadSound(url: string): Promise<AudioBuffer> {
  return preloadSound(url);
}

/**
 * Play a PRELOADED sound with looping and volume control
 * Returns a unique playback ID for later control
 * MUST be called within a user gesture event handler (click, keydown, etc.)
 * Sound must have been preloaded with preloadSound() first
 */
export function playSound(
  url: string,
  options: { loop?: boolean; volume?: number; fadeIn?: number } = {}
): string {
  const { loop = true, volume = 1, fadeIn = 0 } = options;
  const ctx = getAudioContext();

  const buffer = soundBuffers.get(url);
  if (!buffer) {
    console.warn(`Sound not preloaded: ${url}. Playback may fail due to autoplay policy.`);
    // Fallback: try to load and play (may not work due to autoplay policy)
    return playSoundUncached(url, options);
  }

  const playbackId = `${url}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  // Create source and gain nodes
  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  // Set up gain (volume) with optional fade-in
  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  if (fadeIn > 0) {
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
  } else {
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  }

  // Connect: source -> gain -> destination
  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Play immediately with preloaded buffer (synchronous, within user gesture)
  source.buffer = buffer;
  source.loop = loop;
  source.start(0);

  playingSources.set(playbackId, { source, gain: gainNode });
  return playbackId;
}

/**
 * Internal: play sound without preloaded buffer (fallback, may fail autoplay)
 */
function playSoundUncached(
  url: string,
  options: { loop?: boolean; volume?: number; fadeIn?: number } = {}
): string {
  const { loop = true, volume = 1, fadeIn = 0 } = options;
  const ctx = getAudioContext();

  const playbackId = `${url}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  if (fadeIn > 0) {
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + fadeIn);
  } else {
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  }

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  loadSound(url).then((buffer) => {
    source.buffer = buffer;
    source.loop = loop;
    source.start(0);
  });

  playingSources.set(playbackId, { source, gain: gainNode });
  return playbackId;
}

/**
 * Stop a specific playback by ID with optional fade-out
 */
export function stopSound(playbackId: string, fadeOut = 0.5): void {
  const entry = playingSources.get(playbackId);
  if (!entry) return;

  const { source, gain } = entry;
  const ctx = getAudioContext();

  if (fadeOut > 0) {
    const startTime = ctx.currentTime;
    const currentGain = gain.gain.value;
    gain.gain.setValueAtTime(currentGain, startTime);
    gain.gain.linearRampToValueAtTime(0, startTime + fadeOut);

    // Stop source after fade-out
    setTimeout(() => {
      try {
        source.stop();
      } catch {
        // Already stopped
      }
      playingSources.delete(playbackId);
    }, fadeOut * 1000 + 50);
  } else {
    try {
      source.stop();
    } catch {
      // Already stopped
    }
    playingSources.delete(playbackId);
  }
}

/**
 * Crossfade from one sound to another
 * Returns the new playback ID
 */
export async function crossfade(
  fromId: string | null,
  toUrl: string,
  options: { duration?: number; volume?: number; loop?: boolean } = {}
): Promise<string> {
  const { duration = 1, volume = 1, loop = true } = options;
  const ctx = getAudioContext();

  // Fade out old sound
  if (fromId) {
    const fromEntry = playingSources.get(fromId);
    if (fromEntry) {
      const startTime = ctx.currentTime;
      const currentGain = fromEntry.gain.gain.value;
      fromEntry.gain.gain.setValueAtTime(currentGain, startTime);
      fromEntry.gain.gain.linearRampToValueAtTime(0, startTime + duration);

      setTimeout(() => {
        try {
          fromEntry.source.stop();
        } catch {
          // Already stopped
        }
        playingSources.delete(fromId);
      }, duration * 1000 + 50);
    }
  }

  // Fade in new sound (uses preloaded buffer if available)
  const toId = `${toUrl}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const source = ctx.createBufferSource();
  const gainNode = ctx.createGain();

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + duration);

  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  const buffer = soundBuffers.get(toUrl);
  if (buffer) {
    // Preloaded - play immediately
    source.buffer = buffer;
    source.loop = loop;
    source.start(0);
  } else {
    // Not preloaded - load then play (may fail autoplay)
    loadSound(toUrl).then((buf) => {
      source.buffer = buf;
      source.loop = loop;
      source.start(0);
    });
  }

  playingSources.set(toId, { source, gain: gainNode });
  return toId;
}

/**
 * Stop all currently playing sounds
 */
export function stopAllSounds(fadeOut = 0.5): void {
  for (const id of playingSources.keys()) {
    stopSound(id, fadeOut);
  }
}

/**
 * Set master volume for all playing sounds
 */
export function setMasterVolume(volume: number): void {
  // Could implement a master gain node if needed
  for (const { gain } of playingSources.values()) {
    gain.gain.setValueAtTime(volume, getAudioContext().currentTime);
  }
}

/**
 * Check if AudioContext is running (not suspended)
 */
export function isAudioContextRunning(): boolean {
  return audioContext?.state === 'running';
}

/**
 * Resume AudioContext (call on user interaction)
 */
export async function resumeAudioContext(): Promise<AudioContext | null> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}