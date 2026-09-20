// src/components/MusicControls.tsx
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { useBackgroundMusic } from './SoundPlayer'
import tracks from '../data/tracks.json'

const CLIP = 'polygon(9px 0, 100% 0, 100% calc(100% - 9px), calc(100% - 9px) 100%, 0 100%, 0 9px)'

const panel: CSSProperties = {
  clipPath: CLIP,
  WebkitClipPath: CLIP,
  background: 'linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)',
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

interface MusicControlsProps {
  /**
   * false (default): floats at the bottom-right of the screen.
   * true: flows in normal layout, for embedding inside another panel.
   */
  inline?: boolean
}

export default function MusicControls({ inline = false }: MusicControlsProps) {
  const { volume, isPlaying, src, play, toggle, setVolume } = useBackgroundMusic()
  const [pickerOpen, setPickerOpen] = useState(false)

  // Scrollable track list. Rendered in normal flow (not as an absolute overlay) so it is
  // never cut off by a parent's clip-path or overflow.
  const picker = pickerOpen && (
    <div
      role="listbox"
      style={{
        ...panel,
        display: 'flex',
        flexDirection: 'column',
        padding: 6,
        gap: 2,
        alignSelf: inline ? 'stretch' : 'flex-end',
        // scrolls once the list is taller than this
        maxHeight: 'min(40dvh, 240px)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        touchAction: 'pan-y',
        scrollbarWidth: 'thin',
        scrollbarColor: '#8fdee6 transparent',
      }}
    >
      {tracks.map((t) => (
        <button
          key={t.src}
          role="option"
          aria-selected={t.src === src}
          onClick={() => {
            setPickerOpen(false)
            play(t.src)
          }}
          style={{
            flexShrink: 0, // required, otherwise rows squash instead of the list scrolling
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'left',
            padding: '6px 10px',
            border: 'none',
            cursor: 'pointer',
            font: 'inherit',
            letterSpacing: 'inherit',
            textTransform: 'inherit',
            whiteSpace: 'nowrap',
            color: t.src === src ? '#0b1b24' : 'rgba(210, 238, 240, 0.7)',
            background: t.src === src ? 'linear-gradient(135deg, #d3f6f8, #8fdee6)' : 'transparent',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: inline ? 'center' : 'flex-end',
    gap: 6,
    ...(inline
      ? {}
      : {
          position: 'absolute',
          bottom: 'calc(5% + 52px)',
          right: '2%',
          opacity: 0.75,
          filter: 'drop-shadow(0 0 10px rgba(80, 190, 200, 0.2))',
        }),
  }

  return (
    <div style={wrapperStyle}>
      {/* Floating: list opens upward, above the controls */}
      {!inline && picker}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ ...panel, display: 'flex', alignItems: 'center', gap: 10, height: 34, padding: '0 14px' }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            aria-label="Music volume"
            style={{ width: 100, accentColor: '#8fdee6', cursor: 'pointer' }}
          />
          <span style={{ width: 24, textAlign: 'right' }}>{Math.round(volume * 100)}</span>
        </div>

        <button
          onClick={() => setPickerOpen((v) => !v)}
          style={iconButton}
          aria-label="Choose track"
          aria-expanded={pickerOpen}
        >
          <svg {...svgProps}>
            <path d="M9 18V5l11-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="17" cy="16" r="3" />
          </svg>
        </button>

        <button
          onClick={() => toggle(tracks[0].src)}
          style={iconButton}
          aria-label={isPlaying ? 'Mute music' : 'Play music'}
        >
          <svg {...svgProps}>
            <path d="M3 9v6h4l5 4V5L7 9H3z" />
            {isPlaying ? (
              <path d="M16 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12" />
            ) : (
              <path d="M17 9l5 6M22 9l-5 6" />
            )}
          </svg>
        </button>
      </div>

      {/* Inline (inside the info panel): list opens downward, below the controls */}
      {inline && picker}
    </div>
  )
}