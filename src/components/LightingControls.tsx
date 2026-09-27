import type { CSSProperties } from 'react'
import { useRoomLighting } from '../hooks/useRoomLighting'

const CLIP =
  'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'

const panel: CSSProperties = {
  clipPath: CLIP,
  WebkitClipPath: CLIP,
  background:
    'linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  color: '#eafcff',
  fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  fontSize: 11,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

const iconButton: CSSProperties = {
  ...panel,
  width: 38,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
}

const svgProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

interface LightingControlsProps {
  /**
   * false (default): floats at the bottom-right of the screen.
   * true: flows in normal layout, for embedding inside another panel.
   */
  inline?: boolean
}

export default function LightingControls({
  inline = false,
}: LightingControlsProps) {
  const {
    intensity,
    enabled,
    setIntensity,
    toggle,
  } = useRoomLighting()

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    alignItems: inline ? 'center' : 'flex-end',
    gap: 6,
    ...(inline
      ? {}
      : {
          position: 'absolute',
          bottom: 'calc(5% + 10px)',
          right: '2%',
          opacity: 0.75,
          filter: 'drop-shadow(0 0 10px rgba(80, 190, 200, 0.2))',
        }),
  }

  return (
    <div style={wrapperStyle}>
      {/* Intensity slider */}
      <div
        style={{
          ...panel,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          height: 34,
          padding: '0 14px',
        }}
      >
        <input
          type="range"
          min={0}
          max={10}
          step={0.05}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          aria-label="Room light intensity"
          style={{
            width: 100,
            accentColor: '#8fdee6',
            cursor: 'pointer',
          }}
        />

        <span
          style={{
            width: 28,
            textAlign: 'right',
          }}
        >
          {intensity.toFixed(1)}
        </span>
      </div>

      {/* On / Off */}
      <button
        onClick={toggle}
        style={{
          ...iconButton,
          color: enabled ? '#eafcff' : 'rgba(210, 238, 240, 0.35)',
        }}
        aria-label={enabled ? 'Turn lights off' : 'Turn lights on'}
        aria-pressed={enabled}
      >
        <svg {...svgProps}>
          {enabled ? (
            <>
              {/* Bulb */}
              <path d="M9 18h6" />
              <path d="M10 21h4" />
              <path d="M8.5 14.5C7.55 13.58 7 12.3 7 11a5 5 0 0110 0c0 1.3-.55 2.58-1.5 3.5-.8.77-1.25 1.35-1.45 2.5h-4.1c-.2-1.15-.65-1.73-1.45-2.5z" />

              {/* Rays */}
              <path d="M12 2v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M19.07 4.93l-1.41 1.41" />
              <path d="M20 12h2" />
            </>
          ) : (
            <>
              {/* Bulb */}
              <path d="M9 18h6" />
              <path d="M10 21h4" />
              <path d="M8.5 14.5C7.55 13.58 7 12.3 7 11a5 5 0 0110 0c0 1.3-.55 2.58-1.5 3.5-.8.77-1.25 1.35-1.45 2.5h-4.1c-.2-1.15-.65-1.73-1.45-2.5z" />

              {/* Slash */}
              <path d="M4 4l16 16" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}