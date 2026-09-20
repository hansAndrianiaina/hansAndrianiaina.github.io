// src/utils/music.ts
// Global background-music manager. Lives outside React, so components can mount/unmount
// without touching playback. One current track at a time; changing track crossfades.
//
// Deliberately separate from audio.ts (used for short sound effects): music runs on
// HTMLAudioElement, effects run on Web Audio buffers. Neither can stop the other, so a
// click sound never interrupts the background track.
//
// HTMLAudioElement (rather than AudioBuffer) so songs stream instead of being decoded
// into RAM, and remote URLs work without CORS headers.

const DEFAULT_FADE_S = 1.5
const DEFAULT_VOLUME = 0.125

interface Deck {
  el: HTMLAudioElement
  src: string   // the src exactly as the caller passed it (used to identify the track)
  level: number // 0..1 fade level, multiplied by master volume
  raf: number
}

export interface MusicState {
  volume: number
  src: string | null
  isPlaying: boolean
}

let master = DEFAULT_VOLUME
let current: Deck | null = null
let isPlaying = false
let state: MusicState = { volume: master, src: null, isPlaying: false }
const listeners = new Set<() => void>()

/** Bare filenames resolve to public/sounds/<name>; full http(s) URLs pass through. */
function resolveSrc(src: string): string {
  return /^https?:\/\//i.test(src) ? src : import.meta.env.BASE_URL + 'sounds/' + src
}

function applyVolume(deck: Deck) {
  deck.el.volume = Math.min(1, Math.max(0, master * deck.level))
}

function emit() {
  state = { volume: master, src: current?.src ?? null, isPlaying }
  listeners.forEach((l) => l())
}

function fadeTo(deck: Deck, target: number, seconds: number, onDone?: () => void) {
  cancelAnimationFrame(deck.raf) // a new fade replaces any running one (and its onDone)
  const from = deck.level
  const t0 = performance.now()
  const ms = seconds * 1000

  const tick = (now: number) => {
    const t = ms <= 0 ? 1 : Math.min((now - t0) / ms, 1)
    deck.level = from + (target - from) * t
    applyVolume(deck)
    if (t < 1) deck.raf = requestAnimationFrame(tick)
    else onDone?.()
  }
  deck.raf = requestAnimationFrame(tick)
}

function retire(deck: Deck, fade: number) {
  fadeTo(deck, 0, fade, () => {
    deck.el.pause()
    deck.el.removeAttribute('src')
    deck.el.load()
  })
}

// Browsers block audio until a user gesture. If play() is rejected, retry on the next one.
let gestureArmed = false
function retryOnGesture() {
  if (gestureArmed) return
  gestureArmed = true
  const go = () => {
    gestureArmed = false
    window.removeEventListener('pointerdown', go)
    window.removeEventListener('keydown', go)
    if (current && isPlaying && current.el.paused) start(current, DEFAULT_FADE_S)
  }
  window.addEventListener('pointerdown', go)
  window.addEventListener('keydown', go)
}

function start(deck: Deck, fade: number) {
  deck.el
    .play()
    .then(() => {
      if (current === deck && isPlaying) fadeTo(deck, 1, fade)
    })
    .catch(() => retryOnGesture())
}

/** Start a track. If another is playing, crossfade. Same track again = resume, never restart. */
function play(src: string, opts: { fade?: number; loop?: boolean } = {}) {
  const { fade = DEFAULT_FADE_S, loop = true } = opts

  if (current?.src === src) {
    resume(fade)
    return
  }

  const prev = current
  const el = new Audio(resolveSrc(src))
  el.loop = loop
  el.preload = 'auto'

  const deck: Deck = { el, src, level: 0, raf: 0 }
  applyVolume(deck)
  current = deck
  isPlaying = true

  start(deck, fade)
  if (prev) retire(prev, fade)
  emit()
}

/** Fade out and pause, keeping the position so resume() continues where it left off. */
function pause(fade = DEFAULT_FADE_S) {
  if (!current || !isPlaying) return
  const deck = current
  isPlaying = false
  fadeTo(deck, 0, fade, () => deck.el.pause())
  emit()
}

function resume(fade = DEFAULT_FADE_S) {
  if (!current) return
  isPlaying = true
  start(current, fade)
  emit()
}

/** Fade out and discard the current track entirely. */
function stop(fade = DEFAULT_FADE_S) {
  if (!current) return
  retire(current, fade)
  current = null
  isPlaying = false
  emit()
}

/** Pause if playing, resume if paused, otherwise start `defaultSrc`. */
function toggle(defaultSrc: string) {
  if (isPlaying) pause()
  else if (current) resume()
  else play(defaultSrc)
}

function setVolume(v: number) {
  master = Math.min(1, Math.max(0, v))
  if (current) applyVolume(current)
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getState() {
  return state // cached object, as useSyncExternalStore requires
}

export const musicManager = { play, pause, resume, stop, toggle, setVolume, subscribe, getState }