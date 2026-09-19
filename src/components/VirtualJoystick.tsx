import { useRef, useEffect, useState, useCallback, createContext, useContext, ReactNode } from 'react'
import type { CSSProperties } from 'react'

interface JoystickState {
  x: number
  y: number
  active: boolean
}

interface VirtualJoystickContextValue {
  move: JoystickState
  look: JoystickState
  registerMove: (ref: React.RefObject<HTMLDivElement>) => void
  registerLook: (ref: React.RefObject<HTMLDivElement>) => void
  show: () => void
  hide: () => void
}

const VirtualJoystickContext = createContext<VirtualJoystickContextValue | null>(null)

export function useVirtualJoystick() {
  const ctx = useContext(VirtualJoystickContext)
  if (!ctx) throw new Error('useVirtualJoystick must be used within VirtualJoystickProvider')
  return ctx
}

const JOYSTICK_SIZE = 120
const THUMB_SIZE = 50
const MAX_RADIUS = (JOYSTICK_SIZE - THUMB_SIZE) / 2
const AUTO_HIDE_DELAY = 3000
const FADE_DURATION = 300

const baseStyle: CSSProperties = {
  position: 'absolute',
  bottom: 20,
  width: JOYSTICK_SIZE,
  height: JOYSTICK_SIZE,
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  zIndex: 100,
  transition: `opacity ${FADE_DURATION}ms ease, transform ${FADE_DURATION}ms ease`,
}

const ringStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  background: 'radial-gradient(circle at 30% 30%, rgba(190, 240, 245, 0.15), transparent 60%), rgba(11, 27, 36, 0.6)',
  border: '2px solid rgba(190, 240, 245, 0.3)',
  boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(190, 240, 245, 0.1)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
}

const thumbStyle: CSSProperties = {
  position: 'absolute',
  width: THUMB_SIZE,
  height: THUMB_SIZE,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(211, 246, 248, 0.9) 0%, rgba(143, 222, 230, 0.7) 100%)',
  border: '2px solid rgba(190, 240, 245, 0.5)',
  boxShadow: '0 0 15px rgba(190, 245, 250, 0.6), inset 0 -3px 6px rgba(0, 0, 0, 0.2)',
  transform: 'translate(-50%, -50%)',
  transition: 'transform 50ms ease-out',
  pointerEvents: 'none',
}

const labelStyle: CSSProperties = {
  position: 'absolute',
  bottom: -24,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'rgba(190, 240, 245, 0.7)',
  fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
}

function JoystickBase({
  children,
  position,
  label,
  ref,
  opacity,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: {
  children: ReactNode
  position: 'left' | 'right'
  label: string
  ref: React.RefObject<HTMLDivElement>
  opacity: number
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}) {
  const isLeft = position === 'left'
  const horizontalPos = isLeft ? { left: 20 } : { right: 20 }

  return (
    <div
      ref={ref}
      style={{
        ...baseStyle,
        ...horizontalPos,
        opacity,
        pointerEvents: opacity > 0 ? 'auto' : 'none',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      aria-label={label}
      role="joystick"
      aria-orientation="both"
    >
      <div style={ringStyle} />
      {children}
      <div style={labelStyle}>{label}</div>
    </div>
  )
}

function MoveJoystick({ opacity, ref, onTouchStart, onTouchMove, onTouchEnd, thumbPos }: {
  opacity: number
  ref: React.RefObject<HTMLDivElement>
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  thumbPos: { x: number; y: number }
}) {
  return (
    <JoystickBase
      ref={ref}
      position="left"
      label="Move"
      opacity={opacity}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          ...thumbStyle,
          left: `calc(50% + ${thumbPos.x}px)`,
          top: `calc(50% + ${thumbPos.y}px)`,
        }}
      />
    </JoystickBase>
  )
}

function LookJoystick({ opacity, ref, onTouchStart, onTouchMove, onTouchEnd, thumbPos }: {
  opacity: number
  ref: React.RefObject<HTMLDivElement>
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  thumbPos: { x: number; y: number }
}) {
  return (
    <JoystickBase
      ref={ref}
      position="right"
      label="Look"
      opacity={opacity}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          ...thumbStyle,
          left: `calc(50% + ${thumbPos.x}px)`,
          top: `calc(50% + ${thumbPos.y}px)`,
        }}
      />
    </JoystickBase>
  )
}

export function VirtualJoystickProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const moveRef = useRef<HTMLDivElement>(null)
  const lookRef = useRef<HTMLDivElement>(null)

  const [moveState, setMoveState] = useState<JoystickState>({ x: 0, y: 0, active: false })
  const [lookState, setLookState] = useState<JoystickState>({ x: 0, y: 0, active: false })
  const [opacity, setOpacity] = useState(enabled ? 1 : 0)
  const [visible, setVisible] = useState(enabled)

  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const animationFrameRef = useRef<number>()

  const clampPosition = useCallback((clientX: number, clientY: number, ref: React.RefObject<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return { x: 0, y: 0, clampedX: 0, clampedY: 0 }

    const rect = el.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    let dx = clientX - centerX
    let dy = clientY - centerY
    const distance = Math.hypot(dx, dy)

    if (distance > MAX_RADIUS) {
      const ratio = MAX_RADIUS / distance
      dx *= ratio
      dy *= ratio
    }

    const normalizedX = dx / MAX_RADIUS
    const normalizedY = dy / MAX_RADIUS

    return { x: dx, y: dy, clampedX: normalizedX, clampedY: normalizedY }
  }, [])

  const handleMoveStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { clampedX, clampedY } = clampPosition(touch.clientX, touch.clientY, moveRef)
    setMoveState({ x: clampedX, y: clampedY, active: true })
  }, [clampPosition])

  const handleMoveMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { clampedX, clampedY } = clampPosition(touch.clientX, touch.clientY, moveRef)
    setMoveState({ x: clampedX, y: clampedY, active: true })
  }, [clampPosition])

  const handleMoveEnd = useCallback(() => {
    setMoveState({ x: 0, y: 0, active: false })
  }, [])

  const handleLookStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { clampedX, clampedY } = clampPosition(touch.clientX, touch.clientY, lookRef)
    setLookState({ x: clampedX, y: clampedY, active: true })
  }, [clampPosition])

  const handleLookMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const { clampedX, clampedY } = clampPosition(touch.clientX, touch.clientY, lookRef)
    setLookState({ x: clampedX, y: clampedY, active: true })
  }, [clampPosition])

  const handleLookEnd = useCallback(() => {
    setLookState({ x: 0, y: 0, active: false })
  }, [])

  const show = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setVisible(true)
    setOpacity(1)

    hideTimerRef.current = setTimeout(() => {
      setOpacity(0)
      hideTimerRef.current = setTimeout(() => setVisible(false), FADE_DURATION)
    }, AUTO_HIDE_DELAY)
  }, [])

  const hide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setOpacity(0)
    hideTimerRef.current = setTimeout(() => setVisible(false), FADE_DURATION)
  }, [])

  // Smooth return-to-center animation for thumbs
  useEffect(() => {
    let moveX = moveState.x
    let moveY = moveState.y
    let lookX = lookState.x
    let lookY = lookState.y

    const animate = () => {
      if (!moveState.active) {
        moveX *= 0.85
        moveY *= 0.85
        if (Math.abs(moveX) < 0.01) moveX = 0
        if (Math.abs(moveY) < 0.01) moveY = 0
      }
      if (!lookState.active) {
        lookX *= 0.85
        lookY *= 0.85
        if (Math.abs(lookX) < 0.01) lookX = 0
        if (Math.abs(lookY) < 0.01) lookY = 0
      }

      setMoveState(prev => ({ ...prev, x: moveX, y: moveY }))
      setLookState(prev => ({ ...prev, x: lookX, y: lookY }))

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationFrameRef.current!)
  }, [moveState.active, lookState.active, moveState.x, moveState.y, lookState.x, lookState.y])

  const thumbMoveX = moveState.x * MAX_RADIUS
  const thumbMoveY = moveState.y * MAX_RADIUS
  const thumbLookX = lookState.x * MAX_RADIUS
  const thumbLookY = lookState.y * MAX_RADIUS

  const contextValue: VirtualJoystickContextValue = {
    move: moveState,
    look: lookState,
    registerMove: (ref) => { moveRef.current = ref.current },
    registerLook: (ref) => { lookRef.current = ref.current },
    show,
    hide,
  }

  if (!visible && opacity === 0) return <>{children}</>

  return (
    <VirtualJoystickContext.Provider value={contextValue}>
      {children}
      {enabled && (
        <>
          <MoveJoystick
            ref={moveRef}
            opacity={opacity}
            onTouchStart={handleMoveStart}
            onTouchMove={handleMoveMove}
            onTouchEnd={handleMoveEnd}
            thumbPos={{ x: thumbMoveX, y: thumbMoveY }}
          />
          <LookJoystick
            ref={lookRef}
            opacity={opacity}
            onTouchStart={handleLookStart}
            onTouchMove={handleLookMove}
            onTouchEnd={handleLookEnd}
            thumbPos={{ x: thumbLookX, y: thumbLookY }}
          />
        </>
      )}
    </VirtualJoystickContext.Provider>
  )
}

export function VirtualJoystick({ enabled = true }: { enabled?: boolean }) {
  const { move, look, show } = useVirtualJoystick()

  // Expose show for canvas touch handler
  useEffect(() => {
    if (enabled) {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        canvas.addEventListener('touchstart', show, { passive: true })
        return () => canvas.removeEventListener('touchstart', show)
      }
    }
  }, [enabled, show])

  return null // Rendering handled by Provider
}