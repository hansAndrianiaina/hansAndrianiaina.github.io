import { useEffect, useState, useRef } from 'react'
import type { CSSProperties } from 'react'

interface TouchControlOverlayProps {
  mode: 'orbit' | 'walk'
  visible: boolean
  onDismiss: () => void
}

const HINT_DURATION = 5000
const FADE_DURATION = 400

const containerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 24,
  transition: `opacity ${FADE_DURATION}ms ease`,
}

const hintStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '12px 20px',
  background: 'rgba(11, 27, 36, 0.85)',
  border: '1px solid rgba(190, 240, 245, 0.3)',
  borderRadius: 12,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(190, 245, 250, 0.1)',
  maxWidth: '90vw',
  textAlign: 'center',
}

const iconStyle: CSSProperties = {
  flexShrink: 0,
  width: 28,
  height: 28,
  color: 'rgba(190, 240, 245, 0.9)',
}

const textStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.4,
  color: '#eafcff',
  fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
}

const kbdStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  padding: '2px 6px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(190, 240, 245, 0.2)',
  borderRadius: 4,
  fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  color: 'rgba(190, 240, 245, 0.85)',
}

const orbitHints = [
  { icon: DragIcon, text: 'Drag to orbit', desktop: 'Click & drag' },
  { icon: PinchIcon, text: 'Pinch to zoom', desktop: 'Scroll wheel' },
  { icon: TapIcon, text: 'Tap object for info', desktop: 'Click object' },
]

const walkHints = [
  { icon: LeftJoystickIcon, text: 'Left stick: move', desktop: 'WASD / Arrows' },
  { icon: RightJoystickIcon, text: 'Right stick: look', desktop: 'Drag to look' },
  { icon: TapIcon, text: 'Tap object for info', desktop: 'Click object' },
]

function DragIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M5 9l5 5 5-5" />
      <path d="M5 15l5 5 5-5" />
      <path d="M12 3v18" />
    </svg>
  )
}

function PinchIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
      <circle cx="12" cy="5" r="2" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="19" r="2" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function TapIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

function LeftJoystickIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="9" cy="15" r="7" />
      <circle cx="9" cy="15" r="3" fill="currentColor" opacity="0.5" />
      <path d="M9 8v7M16 15H9" />
    </svg>
  )
}

function RightJoystickIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="15" cy="9" r="7" />
      <circle cx="15" cy="9" r="3" fill="currentColor" opacity="0.5" />
      <path d="M15 16v-7M8 9h7" />
    </svg>
  )
}

function HintItem({ icon: Icon, text, desktop }: { icon: React.FC<{ style?: CSSProperties }>; text: string; desktop: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon style={iconStyle} aria-hidden="true" />
      <div style={{ textAlign: 'left' }}>
        <div style={textStyle}>{text}</div>
        <div style={{ ...kbdStyle, fontSize: 10, marginTop: 2 }}>{desktop}</div>
      </div>
    </div>
  )
}

export function TouchControlOverlay({ mode, visible, onDismiss }: TouchControlOverlayProps) {
  const [opacity, setOpacity] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const hints = mode === 'orbit' ? orbitHints : walkHints

  useEffect(() => {
    if (visible) {
      setOpacity(1)
      timerRef.current = setTimeout(() => {
        setOpacity(0)
        timerRef.current = setTimeout(onDismiss, FADE_DURATION)
      }, HINT_DURATION)
    } else {
      setOpacity(0)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [visible, onDismiss])

  if (!visible && opacity === 0) return null

  return (
    <div style={{ ...containerStyle, opacity }} role="status" aria-live="polite" aria-atomic="true">
      {hints.map((hint, i) => (
        <div key={i} style={hintStyle}>
          <HintItem {...hint} />
        </div>
      ))}
    </div>
  )
}