// components/ControlModeToggle.tsx
import { useEffect, useState, type CSSProperties } from 'react'
import { useMobile } from '../hooks/useMobile'

type ControlMode = 'orbit' | 'walk'

const TRACK_CLIP = 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'
const PILL_CLIP = 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)'

// Mobile: larger touch targets (min 44px), bottom-center
// Desktop: current bottom-right design

export default function ControlModeToggle({
  mode,
  onChange,
}: {
  mode: ControlMode
  onChange: (m: ControlMode) => void
}) {
  const { isMobile, isTablet } = useMobile()
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const isMobileLayout = isMobile || (isTablet && isTouch)

  // 1. Move positioning, opacity, and the drop-shadow to an un-clipped wrapper
  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    bottom: isMobileLayout ? '2%' : '5%',
    left: isMobileLayout ? '50%' : 'auto',
    right: isMobileLayout ? 'auto' : '2%',
    transform: isMobileLayout ? 'translateX(-50%)' : 'none',
    opacity: 0.75,
    filter: 'drop-shadow(0 0 10px rgba(80, 190, 200, 0.2))',
    zIndex: 200,
  }

  // 2. Keep the clip-path, backgrounds, and layout here
  const trackStyle: CSSProperties = {
    display: 'flex',
    padding: isMobileLayout ? 6 : 3,
    clipPath: TRACK_CLIP,
    WebkitClipPath: TRACK_CLIP,
    background: `
      radial-gradient(rgba(173,227,232,0.35) 1px, transparent 1.5px),
      linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)
    `,
    backgroundSize: '14px 14px, auto',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    border: '1px solid rgba(190, 240, 245, 0.3)',
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  }

  const pillStyle: CSSProperties = {
    position: 'absolute',
    top: isMobileLayout ? 6 : 3,
    left: isMobileLayout ? 6 : 3,
    width: isMobileLayout ? 'calc(50% - 6px)' : 'calc(50% - 3px)',
    height: isMobileLayout ? 'calc(100% - 12px)' : 'calc(100% - 6px)',
    clipPath: PILL_CLIP,
    WebkitClipPath: PILL_CLIP,
    background: 'linear-gradient(135deg, #d3f6f8 0%, #8fdee6 100%)',
    boxShadow: '0 0 12px rgba(150, 235, 240, 0.55)',
    transform: `translateX(${mode === 'walk' ? '100%' : '0'})`,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }

  const segmentStyle = (active: boolean): CSSProperties => ({
    position: 'relative',
    zIndex: 1,
    width: isMobileLayout ? 88 : 72,
    minHeight: isMobileLayout ? 44 : 0, // WCAG AA touch target
    padding: isMobileLayout ? '10px 0' : '7px 0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: isMobileLayout ? 13 : 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'inherit',
    color: active ? '#0b1b24' : 'rgba(210, 238, 240, 0.6)',
    transition: 'color 0.3s ease',
    touchAction: 'manipulation',
  })

  return (
    <div style={wrapperStyle}>
      <div style={trackStyle}>
        <div style={pillStyle} />
        <button onClick={() => onChange('orbit')} style={segmentStyle(mode === 'orbit')}>
          Orbit
        </button>
        <button onClick={() => onChange('walk')} style={segmentStyle(mode === 'walk')}>
          Walk
        </button>
      </div>
    </div>
  )
}