// src/components/AnimationInfoPanel.tsx
import type { CSSProperties } from 'react'

interface AnimationInfoPanelProps {
  title: string
  subtitle?: string
  visible: boolean
}

// Corner chamfer sizes as % of box width/height (top-left, top-right, bottom-right, bottom-left)
const CUT = { tl: 6, tr: 4, br: 9, bl: 4 }

const CLIP_PATH = `polygon(${CUT.tl}% 0, ${100 - CUT.tr}% 0, 100% ${CUT.tr}%, 100% ${
  100 - CUT.br
}%, ${100 - CUT.br}% 100%, ${CUT.bl}% 100%, 0 ${100 - CUT.bl}%, 0 ${CUT.tl}%)`

const FRAME_POINTS = `${CUT.tl},0 ${100 - CUT.tr},0 100,${CUT.tr} 100,${100 - CUT.br} ${
  100 - CUT.br
},100 ${CUT.bl},100 0,${100 - CUT.bl} 0,${CUT.tl} ${CUT.tl},0`

export default function AnimationInfoPanel({ title, subtitle, visible }: AnimationInfoPanelProps) {
  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    bottom: '5%',
    left: '50%',
    transform: `translateX(-50%) translateX(${visible ? '0' : '16px'}) scale(${visible ? 1 : 0.98})`,
    opacity: visible ? 0.75 : 0,
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    pointerEvents: 'none',
    minWidth: 300,
    maxWidth: 900,
    filter: 'drop-shadow(0 0 18px rgba(80, 190, 200, 0.25))', 
  }

  const panelStyle: CSSProperties = {
    position: 'relative',
    padding: '22px 26px',
    clipPath: CLIP_PATH,
    WebkitClipPath: CLIP_PATH,
    background: `
      linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.07) 44%, transparent 46%, transparent 54%, rgba(255,255,255,0.05) 56%, transparent 58%),
      radial-gradient(rgba(173,227,232,0.4) 1px, transparent 1.5px),
      linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)
    `,
    backgroundSize: 'auto, 16px 16px, auto',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    color: '#eafcff',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    textAlign: 'center',
  }

  return (
    <div style={wrapperStyle}>
      <div style={panelStyle}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow: '0 0 8px rgba(160, 230, 235, 0.35)',
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              lineHeight: 1.6,
              letterSpacing: '0.01em',
              color: 'rgba(210, 238, 240, 0.7)',
              fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      {/* HUD frame outline + accent details, stretched over the panel */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <polyline
          points={FRAME_POINTS}
          fill="none"
          stroke="rgba(180, 235, 240, 0.35)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {/* bright glowing accent along the bottom-right edge */}
        <polyline
          points={`100,${100 - CUT.br - 3} 100,${100 - CUT.br} ${100 - CUT.br},100 30,100`}
          fill="none"
          stroke="#eafcff"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
        />
        {/* bright tab on the right edge */}
        <line
          x1="100"
          y1="26"
          x2="100"
          y2="38"
          stroke="#eafcff"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
        />
        {/* ruler-style ticks along the left edge */}
        {[58, 64, 70, 76, 82].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="3.2"
            y2={y}
            stroke="rgba(220, 245, 248, 0.8)"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}