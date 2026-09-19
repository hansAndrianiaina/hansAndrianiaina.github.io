// src/components/VirtualJoystick.tsx
// Dual on-screen joysticks for Walk mode on touch devices.
//   left  = move (forward / back / strafe)
//   right = look (yaw / pitch, rate-based)
//
// Values are written to the shared `touchInput` object (see interaction/touchInput.ts),
// which WalkControls reads each frame. Thumb movement is applied straight to the DOM
// node, so dragging never triggers a React re-render.
//
// Keyboard fallback: WalkControls already handles WASD / arrow keys.
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { touchInput, resetTouchInput } from '../interaction/touchInput'

const BASE_SIZE = 120
const THUMB_SIZE = 52
const MAX_TRAVEL = 40 // px the thumb centre can move from the base centre
const DEADZONE = 0.12
const HIDE_AFTER_MS = 3000
const FADE_MS = 300

interface JoystickProps {
  label: string
  /** x: right = +1, y: up = +1 */
  onChange: (x: number, y: number) => void
  onActiveChange: (active: boolean) => void
}

const baseStyle: CSSProperties = {
  position: 'relative',
  width: BASE_SIZE,
  height: BASE_SIZE,
  borderRadius: '50%',
  pointerEvents: 'auto',
  touchAction: 'none', // stop the browser from scrolling/zooming while dragging the stick
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  background: `
    radial-gradient(rgba(173,227,232,0.3) 1px, transparent 1.5px),
    radial-gradient(circle at 50% 42%, rgba(29,77,85,0.75) 0%, rgba(11,27,36,0.85) 100%)
  `,
  backgroundSize: '14px 14px, auto',
  border: '1px solid rgba(190, 240, 245, 0.35)',
  boxShadow: '0 0 18px rgba(80, 190, 200, 0.22), inset 0 0 20px rgba(80, 190, 200, 0.12)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
}

const ringStyle: CSSProperties = {
  position: 'absolute',
  inset: 20,
  borderRadius: '50%',
  border: '1px solid rgba(190, 240, 245, 0.18)',
  pointerEvents: 'none',
}

const thumbStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: THUMB_SIZE,
  height: THUMB_SIZE,
  marginLeft: -THUMB_SIZE / 2,
  marginTop: -THUMB_SIZE / 2,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #d3f6f8 0%, #8fdee6 100%)',
  boxShadow: '0 0 12px rgba(150, 235, 240, 0.55)',
  opacity: 0.9,
  pointerEvents: 'none',
  willChange: 'transform',
}

function Joystick({ label, onChange, onActiveChange }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const pointerId = useRef<number | null>(null)
  const center = useRef({ x: 0, y: 0 })

  const moveThumb = (tx: number, ty: number, animate: boolean) => {
    const thumb = thumbRef.current
    if (!thumb) return
    thumb.style.transition = animate ? 'transform 0.15s ease-out' : 'none'
    thumb.style.transform = `translate(${tx}px, ${ty}px)`
  }

  const update = (clientX: number, clientY: number) => {
    const dx = clientX - center.current.x
    const dy = clientY - center.current.y
    const angle = Math.atan2(dy, dx)
    const clamped = Math.min(Math.hypot(dx, dy), MAX_TRAVEL)

    moveThumb(Math.cos(angle) * clamped, Math.sin(angle) * clamped, false)

    const magnitude = clamped / MAX_TRAVEL
    if (magnitude < DEADZONE) {
      onChange(0, 0)
      return
    }
    // Re-scale so output ramps smoothly from 0 at the edge of the deadzone to 1 at full deflection.
    const scaled = (magnitude - DEADZONE) / (1 - DEADZONE)
    onChange(Math.cos(angle) * scaled, -Math.sin(angle) * scaled) // screen-y is down, stick-y is up
  }

  const release = () => {
    if (pointerId.current === null) return
    pointerId.current = null
    moveThumb(0, 0, true)
    onChange(0, 0)
    onActiveChange(false)
  }

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== null) return // this stick already has a finger on it
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    center.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    pointerId.current = e.pointerId
    base.setPointerCapture(e.pointerId) // keep receiving events even if the finger leaves the base
    onActiveChange(true)
    update(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerId.current) return
    update(e.clientX, e.clientY)
  }

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerId.current) return
    release()
  }

  return (
    <div
      ref={baseRef}
      role="group"
      aria-label={label}
      style={baseStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onLostPointerCapture={handlePointerEnd}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={ringStyle} />
      <div ref={thumbRef} style={thumbStyle} />
    </div>
  )
}

export default function VirtualJoysticks() {
  const [visible, setVisible] = useState(true) // visible on entering Walk mode so users discover them
  const activeCount = useRef(0)
  const hideTimer = useRef<number | undefined>(undefined)

  const scheduleHide = useCallback(() => {
    window.clearTimeout(hideTimer.current)
    if (activeCount.current > 0) return // never hide while a finger is on a stick
    hideTimer.current = window.setTimeout(() => setVisible(false), HIDE_AFTER_MS)
  }, [])

  useEffect(() => {
    scheduleHide()

    // Any touch on the screen brings the sticks back.
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return
      setVisible(true)
      scheduleHide()
    }
    window.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true)
      window.clearTimeout(hideTimer.current)
      resetTouchInput() // never leave the camera drifting after unmount / mode switch
    }
  }, [scheduleHide])

  const handleActiveChange = useCallback(
    (active: boolean) => {
      activeCount.current = Math.max(0, activeCount.current + (active ? 1 : -1))
      if (active) {
        setVisible(true)
        window.clearTimeout(hideTimer.current)
      } else {
        scheduleHide()
      }
    },
    [scheduleHide],
  )

  const handleMove = useCallback((x: number, y: number) => {
    touchInput.moveX = x
    touchInput.moveY = y
  }, [])

  const handleLook = useCallback((x: number, y: number) => {
    touchInput.lookX = x
    touchInput.lookY = y
  }, [])

  // Sits above the mode toggle (which is bottom-centre on mobile) so nothing overlaps.
  const containerStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))',
    paddingLeft: 'calc(20px + env(safe-area-inset-left, 0px))',
    paddingRight: 'calc(20px + env(safe-area-inset-right, 0px))',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    pointerEvents: 'none', // only the sticks themselves are interactive
    zIndex: 5,
    opacity: visible ? 1 : 0, // faded-out sticks still work; touching them (or the screen) shows them again
    transition: `opacity ${FADE_MS}ms ease`,
  }

  return (
    <div style={containerStyle}>
      <Joystick label="Movement joystick" onChange={handleMove} onActiveChange={handleActiveChange} />
      <Joystick label="Look joystick" onChange={handleLook} onActiveChange={handleActiveChange} />
    </div>
  )
}