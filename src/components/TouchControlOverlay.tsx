// src/components/TouchControlOverlay.tsx
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type ControlMode = 'orbit' | 'walk'

const SHOW_DELAY_MS = 50   // lets the first render paint at opacity 0 so the fade-in runs
const AUTO_DISMISS_MS = 10000
const FADE_MS = 400

const CLIP = 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'

// Module level: lives for the whole page load, survives unmount/remount,
// and is wiped on refresh. Holds keys like "orbit:true".
const seen = new Set<string>()

export default function TouchControlOverlay({ mode, touch = false }: { mode: ControlMode; touch?: boolean }) {
  const [visible, setVisible] = useState(false)
  const modeRef = useRef(mode)
  const containerRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)

  const HINTS: Record<ControlMode, string[]> = {
    orbit: touch
      ? ['Drag to orbit', 'Pinch to zoom', 'Tap an object for info']
      : ['Click and drag to orbit', 'Scroll to zoom', 'Click an object for info'],
    walk: touch
      ? ['Left stick to move', 'Right stick to look', 'Tap an object for info']
      : ['Use WASD or arrow keys to move', 'Click and drag to look', 'Click an object for info'],
  }

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  // Show hints the first time each (mode, touch) combination is entered.
  // Dismiss on timeout or on the first interaction.
  useEffect(() => {
    const key = `${mode}:${touch}`
    if (seen.has(key)) {
      setVisible(false)
      return
    }

    const dismiss = () => setVisible(false)

    // Marked as seen only when actually shown, so StrictMode's double effect
    // run (and quick mode switches) don't consume the hint without displaying it.
    const showTimer = window.setTimeout(() => {
      seen.add(key)
      setVisible(true)
    }, SHOW_DELAY_MS)
    const hideTimer = window.setTimeout(dismiss, SHOW_DELAY_MS + AUTO_DISMISS_MS)

    const events = ['pointerdown', 'keydown', 'wheel'] as const
    events.forEach((ev) => window.addEventListener(ev, dismiss, { capture: true, passive: true }))

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
      events.forEach((ev) => window.removeEventListener(ev, dismiss, { capture: true }))
      setVisible(false)
    }
  }, [mode, touch])

  // Touch ripple (Orbit mode only), independent of the hints
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch' || modeRef.current !== 'orbit' || reduceMotion) return
      const el = rippleRef.current
      const box = containerRef.current
      if (!el || !box) return
      const rect = box.getBoundingClientRect()
      el.style.left = `${e.clientX - rect.left}px`
      el.style.top = `${e.clientY - rect.top}px`
      el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.8 },
          { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 },
        ],
        { duration: 450, easing: 'ease-out' },
      )
    }

    window.addEventListener('pointerdown', onPointerDown, true)
    return () => window.removeEventListener('pointerdown', onPointerDown, true)
  }, [])

  const containerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    zIndex: 6,
  }

  const hintWrapStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '38%',
    transform: 'translate(-50%, -50%)',
    maxWidth: 'calc(100vw - 48px)',
    opacity: visible ? 0.9 : 0,
    transition: `opacity ${FADE_MS}ms ease`,
    filter: 'drop-shadow(0 0 14px rgba(80, 190, 200, 0.25))',
  }

  const hintPanelStyle: CSSProperties = {
    padding: '14px 22px',
    clipPath: CLIP,
    WebkitClipPath: CLIP,
    background: `
      radial-gradient(rgba(173,227,232,0.35) 1px, transparent 1.5px),
      linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)
    `,
    backgroundSize: '14px 14px, auto',
    border: '1px solid rgba(190, 240, 245, 0.3)',
    color: '#eafcff',
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    fontSize: 13,
    lineHeight: 1.9,
    letterSpacing: '0.03em',
    textAlign: 'center',
  }

  const rippleStyle: CSSProperties = {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: '2px solid rgba(190, 245, 250, 0.9)',
    boxShadow: '0 0 12px rgba(150, 235, 240, 0.6)',
    opacity: 0,
    pointerEvents: 'none',
  }

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={hintWrapStyle} role="status" aria-live="polite" aria-hidden={!visible}>
        <div style={hintPanelStyle}>
          {HINTS[mode].map((hint) => (
            <div key={hint}>{hint}</div>
          ))}
        </div>
      </div>
      <div ref={rippleRef} style={rippleStyle} />
    </div>
  )
}