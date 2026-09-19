// src/hooks/useMobile.ts
// Touch / screen-size detection.
//
// - `isTouch` is computed synchronously on first render, so it can be used in a
//   useState initializer (e.g. default control mode) with no flash of the wrong UI.
// - All components share ONE set of window listeners (module-level store read via
//   useSyncExternalStore), no matter how many components call the hook.
import { useSyncExternalStore } from 'react'

export interface MobileState {
  /** Primary input is a finger (not a mouse). Hybrid laptops with a mouse report false. */
  isTouch: boolean
  /** Width < 768px, or a touch device in landscape with a short viewport (phone). */
  isMobile: boolean
  /** 768px <= width < 1024px and not mobile. */
  isTablet: boolean
  isPortrait: boolean
}

const MOBILE_MAX_WIDTH = 768
const TABLET_MAX_WIDTH = 1024
const LANDSCAPE_PHONE_MAX_HEIGHT = 500

const SERVER_STATE: MobileState = {
  isTouch: false,
  isMobile: false,
  isTablet: false,
  isPortrait: false,
}

function detect(): MobileState {
  const w = window.innerWidth
  const h = window.innerHeight
  const isTouch =
    window.matchMedia('(pointer: coarse)').matches ||
    (window.matchMedia('(hover: none)').matches && navigator.maxTouchPoints > 0)
  const isMobile = w < MOBILE_MAX_WIDTH || (isTouch && h < LANDSCAPE_PHONE_MAX_HEIGHT)
  const isTablet = !isMobile && w < TABLET_MAX_WIDTH
  return { isTouch, isMobile, isTablet, isPortrait: h > w }
}

let snapshot: MobileState | null = null
const listeners = new Set<() => void>()

function getSnapshot(): MobileState {
  if (snapshot === null) snapshot = detect()
  return snapshot
}

function getServerSnapshot(): MobileState {
  return SERVER_STATE
}

function refresh() {
  const prev = getSnapshot()
  const next = detect()
  // Keep the same object identity when nothing changed, otherwise React re-renders on every resize tick.
  if (
    next.isTouch === prev.isTouch &&
    next.isMobile === prev.isMobile &&
    next.isTablet === prev.isTablet &&
    next.isPortrait === prev.isPortrait
  ) {
    return
  }
  snapshot = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    snapshot = detect()
    window.addEventListener('resize', refresh)
    window.addEventListener('orientationchange', refresh)
  }
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) {
      window.removeEventListener('resize', refresh)
      window.removeEventListener('orientationchange', refresh)
    }
  }
}

export function useMobile(): MobileState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}