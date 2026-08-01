// components/ControlModeToggle.tsx
import type { CSSProperties } from 'react'

type ControlMode = 'orbit' | 'walk'

const TRACK_CLIP = 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'
const PILL_CLIP = 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)'

export default function ControlModeToggle({
  mode,
  onChange,
}: {
  mode: ControlMode
  onChange: (m: ControlMode) => void
}) {
  // 1. Move positioning, opacity, and the drop-shadow to an un-clipped wrapper
  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    bottom: '5%',
    right: '2%',
    opacity: 0.75,
    filter: 'drop-shadow(0 0 10px rgba(80, 190, 200, 0.2))',
  }

  // 2. Keep the clip-path, backgrounds, and layout here
  const trackStyle: CSSProperties = {
    display: 'flex',
    padding: 3,
    clipPath: TRACK_CLIP,
    WebkitClipPath: TRACK_CLIP,
    background: `
      radial-gradient(rgba(173,227,232,0.35) 1px, transparent 1.5px),
      linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)
    `,
    backgroundSize: '14px 14px, auto',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    // Note: Standard borders don't follow clip-paths well in CSS, 
    // but leaving this here won't break it if it works for your use case.
    border: '1px solid rgba(190, 240, 245, 0.3)',
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  }

  const pillStyle: CSSProperties = {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 'calc(50% - 3px)',
    height: 'calc(100% - 6px)',
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
    width: 72,
    padding: '7px 0',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    fontFamily: 'inherit',
    color: active ? '#0b1b24' : 'rgba(210, 238, 240, 0.6)',
    transition: 'color 0.3s ease',
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