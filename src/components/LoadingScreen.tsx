// src/components/LoadingScreen.tsx
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useProgress } from '@react-three/drei'

interface LoadingScreenProps {
  /** Parent flips this to false once the scene is actually ready to reveal. */
  show: boolean
  /** Fade-out duration in ms — kept in sync with the CSS transition below. */
  fadeDuration?: number
}

// Same technique as AnimationInfoPanel: chamfered corners as % of box size.
const CUT = { tl: 4, tr: 3, br: 6, bl: 3 }

const CLIP_PATH = `polygon(${CUT.tl}% 0, ${100 - CUT.tr}% 0, 100% ${CUT.tr}%, 100% ${
  100 - CUT.br
}%, ${100 - CUT.br}% 100%, ${CUT.bl}% 100%, 0 ${100 - CUT.bl}%, 0 ${CUT.tl}%)`

const FRAME_POINTS = `${CUT.tl},0 ${100 - CUT.tr},0 100,${CUT.tr} 100,${100 - CUT.br} ${
  100 - CUT.br
},100 ${CUT.bl},100 0,${100 - CUT.bl} 0,${CUT.tl} ${CUT.tl},0`

function shortAssetName(url: string) {
  const clean = url.split('?')[0]
  const parts = clean.split('/')
  return parts[parts.length - 1] || url
}

export default function LoadingScreen({ show, fadeDuration = 700 }: LoadingScreenProps) {
  const { progress, item } = useProgress()
  const [mounted, setMounted] = useState(true)
  const lastItem = useRef('')
  if (item) lastItem.current = shortAssetName(item)

  // Stay mounted through the fade-out, then unmount so the overlay stops
  // blocking pointer events / taking up a paint layer.
  useEffect(() => {
    if (show) return
    const t = setTimeout(() => setMounted(false), fadeDuration)
    return () => clearTimeout(t)
  }, [show, fadeDuration])

  if (!mounted) return null

  const pct = Math.min(100, Math.round(progress))

  const overlayStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: `
      radial-gradient(rgba(173,227,232,0.14) 1px, transparent 1.5px),
      radial-gradient(circle at 50% 42%, #123a44 0%, #0b1b24 72%)
    `,
    backgroundSize: '16px 16px, auto',
    opacity: show ? 1 : 0,
    transition: `opacity ${fadeDuration}ms ease`,
    pointerEvents: show ? 'auto' : 'none',
  }

  const panelStyle: CSSProperties = {
    position: 'relative',
    width: 'min(320px, 78vw)',
    padding: '30px 32px 26px',
    clipPath: CLIP_PATH,
    WebkitClipPath: CLIP_PATH,
    background: `
      linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.06) 44%, transparent 46%, transparent 54%, rgba(255,255,255,0.04) 56%, transparent 58%),
      linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)
    `,
    border: '1px solid rgba(180,235,240,0.12)',
    color: '#eafcff',
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    textAlign: 'center',
  }

  const barWrapStyle: CSSProperties = {
    position: 'relative',
    height: 10,
    marginBottom: 16,
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.08)',
    clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)',
  }

  const barFillStyle: CSSProperties = {
    position: 'relative',
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #4fb8c4, #eafcff)',
    boxShadow: '0 0 10px rgba(190,245,250,0.7)',
    transition: 'width 0.25s ease-out',
  }

  return (
    <div
      style={overlayStyle}
      role="status"
      aria-live="polite"
      aria-busy={pct < 100}
      aria-label={`Loading scene, ${pct}%`}
    >
      {/* Signature motion: one slow radar-style sweep down the screen. */}
      <div
        className="ls-scanline"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: 2,
          top: 0,
          background: 'linear-gradient(90deg, transparent, rgba(190,245,250,0.75), transparent)',
        }}
      />

      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          <span
            className="ls-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#8fdee6',
              boxShadow: '0 0 6px rgba(143,222,230,0.9)',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'rgba(210,238,240,0.75)',
            }}
          >
            Initializing
          </span>
        </div>

        <div
          style={{
            fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            fontSize: 42,
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 18,
            textShadow: '0 0 14px rgba(160,230,235,0.4)',
          }}
        >
          {pct}
          <span style={{ fontSize: 18, opacity: 0.6 }}>%</span>
        </div>

        <div style={barWrapStyle} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div style={barFillStyle}>
            <div
              className="ls-stripes"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'repeating-linear-gradient(115deg, rgba(255,255,255,0.35) 0 6px, transparent 6px 14px)',
                mixBlendMode: 'overlay',
              }}
            />
          </div>
        </div>

        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.03em',
            color: 'rgba(210,238,240,0.55)',
            fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {pct < 100 ? lastItem.current || 'preparing environment' : 'ready'}
        </div>

        {/* HUD frame outline + ruler ticks, same device as AnimationInfoPanel */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <polyline
            points={FRAME_POINTS}
            fill="none"
            stroke="rgba(180, 235, 240, 0.35)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points={`100,${100 - CUT.br - 3} 100,${100 - CUT.br} ${100 - CUT.br},100 30,100`}
            fill="none"
            stroke="#eafcff"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
          />
          {[20, 26, 32].map((y) => (
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

      <style>{`
        @keyframes ls-scan {
          0%   { transform: translateY(-10%); opacity: 0; }
          8%   { opacity: 0.5; }
          50%  { opacity: 0.5; }
          92%  { opacity: 0; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes ls-blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }
        @keyframes ls-stripes {
          from { background-position: 0 0; }
          to   { background-position: 40px 0; }
        }
        .ls-scanline { animation: ls-scan 3.2s ease-in-out infinite; }
        .ls-dot       { animation: ls-blink 1.6s ease-in-out infinite; }
        .ls-stripes   { animation: ls-stripes 1s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ls-scanline, .ls-dot, .ls-stripes { animation: none !important; }
        }
      `}</style>
    </div>
  )
}