// src/components/TouchControlOverlay.tsx
// Gesture hints shown once, on the first touch. Dismisses after 5s or on the next
// touch (ignoring a 1s grace window so the second finger of a pinch doesn't close it).
//
// Also draws a small ripple where the finger lands in Orbit mode, as visual feedback
// (Walk mode already has the joysticks for that).
//
// Everything is driven by refs / CSS transitions / Web Animations: no per-touch React renders.
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type ControlMode = 'orbit' | 'walk'

const AUTO_DISMISS_MS = 5000
const GRACE_MS = 1000
const FADE_MS = 400

const HINTS: Record<ControlMode, string[]> = {
  orbit: ['Drag to orbit', 'Pinch to zoom', 'Tap an object for info'],
  walk: ['Left stick to move', 'Right stick to look', 'Tap an object for info'],
}

const CLIP = 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'

export default function TouchControlOverlay({ mode }: { mode: ControlMode }) {
  const [visible, setVisible] = useState(false)
  const modeRef = useRef(mode)
  const containerRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    let phase: 'idle' | 'shown' | 'done' = 'idle'
    let shownAt = 0
    let timer: number | undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const dismiss = () => {
      if (phase === 'done') return
      phase = 'done'
      window.clearTimeout(timer)
      setVisible(false)
    }

    const ripple = (clientX: number, clientY: number) => {
      const el = rippleRef.current
      const box = containerRef.current
      if (!el || !box || reduceMotion) return
      const rect = box.getBoundingClientRect()
      el.style.left = `${clientX - rect.left}px`
      el.style.top = `${clientY - rect.top}px`
      el.animate(
        [
          { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0.8 },
          { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 0 },
        ],
        { duration: 450, easing: 'ease-out' },
      )
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return

      if (modeRef.current === 'orbit') ripple(e.clientX, e.clientY)

      if (phase === 'idle') {
        phase = 'shown'
        shownAt = performance.now()
        setVisible(true)
        timer = window.setTimeout(dismiss, AUTO_DISMISS_MS)
      } else if (phase === 'shown' && performance.now() - shownAt > GRACE_MS) {
        dismiss()
      }
    }

    window.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.clearTimeout(timer)
    }
  }, [])

  const containerStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none', // never blocks the canvas
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