'use client'

import { useState, useEffect, type CSSProperties } from 'react'
import { useMobile } from '../hooks/useMobile'

// Corner chamfer sizes as % of box width/height (top-left, top-right, bottom-right, bottom-left)
const CUT = { tl: 6, tr: 4, br: 9, bl: 4 }

const CLIP_PATH = `polygon(${CUT.tl}% 0, ${100 - CUT.tr}% 0, 100% ${CUT.tr}%, 100% ${
  100 - CUT.br
}%, ${100 - CUT.br}% 100%, ${CUT.bl}% 100%, 0 ${100 - CUT.bl}%, 0 ${CUT.tl}%)`

const FRAME_POINTS = `${CUT.tl},0 ${100 - CUT.tr},0 100,${CUT.tr} 100,${100 - CUT.br} ${
  100 - CUT.br
},100 ${CUT.bl},100 0,${100 - CUT.bl} 0,${CUT.tl} ${CUT.tl},0`

const CHIP_CLIP = 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)'

const NAME = 'Hanssi Andrianiaina Rasolomanana'
const INITIALS = 'HR'

const LINKS = [
  { label: 'Email', href: 'mailto:rasanssian@gmail.com', external: false },
  { label: 'GitHub', href: 'https://github.com/hansAndrianiaina', external: true },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/hanssi-andrianiaina-rasolomanana-047183205/',
    external: true,
  },
]

export default function InfoPanel() {
  const { isMobile, isTablet } = useMobile()
  const [minimized, setMinimized] = useState(true)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const isMobileLayout = isMobile || (isTablet && isTouch)

  // Mobile: start minimized, full-width at bottom with safe area inset
  // Desktop: current behavior
  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    bottom: isMobileLayout ? 'env(safe-area-inset-bottom, 0px)' : '5%',
    left: isMobileLayout ? 0 : '0%',
    right: isMobileLayout ? 0 : 'auto',
    transform: isMobileLayout
      ? `translateX(0) scale(${minimized ? 0.98 : 1})`
      : `translateX(5%)  scale(${minimized ? 0.98 : 1})`,
    opacity: 0.75,
    width: isMobileLayout ? '100%' : (minimized ? 100 : '100%'),
    maxWidth: isMobileLayout ? 'none' : (minimized ? 100 : 340),
    minWidth: isMobileLayout ? 0 : undefined,
    paddingBottom: isMobileLayout ? 'env(safe-area-inset-bottom, 0px)' : 0,
    transition: 'width 0.35s ease, max-width 0.35s ease, transform 0.35s ease',
    filter: 'drop-shadow(0 0 18px rgba(80, 190, 200, 0.22))',
    zIndex: 150,
  }

  const panelStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: isMobileLayout
      ? minimized
        ? '12px 16px'
        : '16px 20px'
      : minimized
        ? '10px'
        : '18px 22px',
    transition: 'padding 0.35s ease',
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
  }

  // Touch-friendly link style (min 44px height)
  const linkStyle: CSSProperties = {
    flex: 1,
    textAlign: 'center',
    padding: isMobileLayout ? '12px 0' : '7px 0',
    minHeight: isMobileLayout ? 44 : undefined,
    clipPath: CHIP_CLIP,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(190, 240, 245, 0.25)',
    color: 'rgba(230, 250, 252, 0.85)',
    fontSize: isMobileLayout ? 12 : 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    touchAction: 'manipulation',
  }

  return (
    <div style={wrapperStyle}>
      <div style={panelStyle}>
        {/* nameplate row: portrait badge + name/title + minimize toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: minimized ? 8 : (isMobileLayout ? 12 : 14),
            transition: 'gap 0.35s ease',
          }}
        >
          <div
            style={{
              position: 'relative',
              flexShrink: 0,
              width: isMobileLayout ? 40 : 46,
              height: isMobileLayout ? 40 : 46,
              clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%, 0 8px)',
              background: 'linear-gradient(155deg, #1d4d55 0%, #0b1b24 100%)',
              border: '1px solid rgba(190, 240, 245, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobileLayout ? 13 : 15,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#eafcff',
              textShadow: '0 0 8px rgba(160, 230, 235, 0.4)',
            }}
          >
            {INITIALS}
          </div>

          <div
            style={{
              flex: minimized ? '0 1 0px' : '1 1 auto',
              minWidth: 0,
              maxWidth: minimized ? 0 : (isMobileLayout ? 'none' : 500),
              opacity: minimized ? 0 : 1,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textAlign: 'left',
              transition: 'max-width 0.35s ease, opacity 0.2s ease',
            }}
          >
            <div
              style={{
                fontSize: isMobileLayout ? 14 : 15,
                fontWeight: 700,
                letterSpacing: '0.02em',
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {NAME}
            </div>
            <div
              style={{
                marginTop: 3,
                fontSize: isMobileLayout ? 10 : 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(210, 238, 240, 0.65)',
                fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              3D Artist / Data Product Engineer
            </div>
          </div>

          <button
            onClick={() => setMinimized((m) => !m)}
            aria-label={minimized ? 'Maximize panel' : 'Minimize panel'}
            aria-expanded={!minimized}
            style={{
              flexShrink: 0,
              width: isMobileLayout ? 36 : 26,
              height: isMobileLayout ? 36 : 26,
              minWidth: isMobileLayout ? 36 : undefined,
              minHeight: isMobileLayout ? 36 : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(190, 240, 245, 0.3)',
              clipPath: 'polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)',
              color: '#eafcff',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 10 10">
              <polyline
                points={minimized ? '1,3.5 5,7.5 9,3.5' : '1,6.5 5,2.5 9,6.5'}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* collapsible body: links */}
        <div
          style={{
            maxHeight: minimized ? 0 : (isMobileLayout ? 140 : 60),
            opacity: minimized ? 0 : 1,
            overflow: 'hidden',
            transition: 'max-height 0.35s ease, opacity 0.25s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: isMobileLayout ? 10 : 8,
              marginTop: isMobileLayout ? 14 : 16,
              paddingTop: isMobileLayout ? 12 : 14,
              borderTop: '1px solid rgba(190, 240, 245, 0.15)',
            }}
          >
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noreferrer' : undefined}
                style={linkStyle}
                onMouseEnter={(e) => {
                  if (!isMobileLayout) {
                    e.currentTarget.style.background = 'rgba(190, 240, 245, 0.12)'
                    e.currentTarget.style.borderColor = 'rgba(190, 240, 245, 0.55)'
                    e.currentTarget.style.color = '#eafcff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobileLayout) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.borderColor = 'rgba(190, 240, 245, 0.25)'
                    e.currentTarget.style.color = 'rgba(230, 250, 252, 0.85)'
                  }
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* HUD frame outline + accent details placed OUTSIDE the clipped panel */}
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
        {/* Bright glowing accent along the bottom-right edge */}
        <polyline
          points={`100,${100 - CUT.br - 3} 100,${100 - CUT.br} ${100 - CUT.br},100 30,100`}
          fill="none"
          stroke="#eafcff"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
        />
        {/* Bright tab on the right edge */}
        <line
          x1="100" y1="26" x2="100" y2="38"
          stroke="#eafcff" strokeWidth={2}
          vectorEffect="non-scaling-stroke"
          style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
        />
        {/* Ruler-style ticks along the left edge */}
        {[58, 64, 70, 76, 82].map((y) => (
          <line
            key={y}
            x1="0" y1={y} x2="3.2" y2={y}
            stroke="rgba(220, 245, 248, 0.8)"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}