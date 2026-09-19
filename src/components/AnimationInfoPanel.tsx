// // src/components/AnimationInfoPanel.tsx
// import type { CSSProperties } from 'react'

// interface AnimationInfoPanelProps {
//   title: string
//   subtitle?: string
//   visible: boolean
//   onClose: () => void
// }

// // Corner chamfer sizes as % of box width/height (top-left, top-right, bottom-right, bottom-left)
// const CUT = { tl: 6, tr: 4, br: 9, bl: 4 }

// const CLIP_PATH = `polygon(${CUT.tl}% 0, ${100 - CUT.tr}% 0, 100% ${CUT.tr}%, 100% ${
//   100 - CUT.br
// }%, ${100 - CUT.br}% 100%, ${CUT.bl}% 100%, 0 ${100 - CUT.bl}%, 0 ${CUT.tl}%)`

// const FRAME_POINTS = `${CUT.tl},0 ${100 - CUT.tr},0 100,${CUT.tr} 100,${100 - CUT.br} ${
//   100 - CUT.br
// },100 ${CUT.bl},100 0,${100 - CUT.bl} 0,${CUT.tl} ${CUT.tl},0`

// export default function AnimationInfoPanel({ title, subtitle, visible, onClose }: AnimationInfoPanelProps) {
//   const wrapperStyle: CSSProperties = {
//     position: 'absolute',
//     top: '5%',
//     right: '0%',
//     transform: `translateX(-5%)  scale(${visible ? 1 : 0.98})`,
//     opacity: visible ? 0.75 : 0,
//     transition: 'opacity 0.6s ease, transform 0.6s ease',
//     pointerEvents: 'none', // wrapper stays click-through; the close button re-enables itself below
//     minWidth: 300,
//     maxWidth: 300,
//     filter: 'drop-shadow(0 0 18px rgba(80, 190, 200, 0.25))', 
//   }

//   const panelStyle: CSSProperties = {
//     position: 'relative',
//     padding: '22px 26px',
//     clipPath: CLIP_PATH,
//     WebkitClipPath: CLIP_PATH,
//     background: `
//       linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.07) 44%, transparent 46%, transparent 54%, rgba(255,255,255,0.05) 56%, transparent 58%),
//       radial-gradient(rgba(173,227,232,0.4) 1px, transparent 1.5px),
//       linear-gradient(155deg, #0b1b24 0%, #123a44 55%, #1d4d55 100%)
//     `,
//     backgroundSize: 'auto, 16px 16px, auto',
//     backdropFilter: 'blur(6px)',
//     WebkitBackdropFilter: 'blur(6px)',
//     color: '#eafcff',
//     fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
//     textAlign: 'center',
//   }

//   const closeButtonStyle: CSSProperties = {
//     position: 'absolute',
//     top: 10,
//     right: 14,
//     width: 20,
//     height: 20,
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     background: 'transparent',
//     border: 'none',
//     borderRadius: 4,
//     color: 'rgba(210, 238, 240, 0.6)',
//     fontSize: 14,
//     lineHeight: 1,
//     cursor: 'pointer',
//     pointerEvents: visible ? 'auto' : 'none', // only clickable while panel is actually visible
//     transition: 'color 0.2s ease, background 0.2s ease',
//   }

//   return (
//     <div style={wrapperStyle}>
//       <div style={panelStyle}>
//         <button
//           type="button"
//           aria-label="Close"
//           onClick={onClose}
//           style={closeButtonStyle}
//           onMouseEnter={(e) => {
//             e.currentTarget.style.color = '#eafcff'
//             e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
//           }}
//           onMouseLeave={(e) => {
//             e.currentTarget.style.color = 'rgba(210, 238, 240, 0.6)'
//             e.currentTarget.style.background = 'transparent'
//           }}
//         >
//           ✕
//         </button>

//         <div
//           style={{
//             fontSize: 14,
//             fontWeight: 700,
//             letterSpacing: '0.12em',
//             textTransform: 'uppercase',
//             textShadow: '0 0 8px rgba(160, 230, 235, 0.35)',
//           }}
//         >
//           {title}
//         </div>
//         {subtitle && (
//           <div
//             style={{
//               marginTop: 8,
//               fontSize: 12,
//               lineHeight: 1.6,
//               letterSpacing: '0.01em',
//               color: 'rgba(210, 238, 240, 0.7)',
//               fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
//             }}
//           >
//             {subtitle}
//           </div>
//         )}
//       </div>

//       {/* HUD frame outline + accent details, stretched over the panel */}
//       <svg
//         viewBox="0 0 100 100"
//         preserveAspectRatio="none"
//         style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
//       >
//         <polyline
//           points={FRAME_POINTS}
//           fill="none"
//           stroke="rgba(180, 235, 240, 0.35)"
//           strokeWidth={1}
//           vectorEffect="non-scaling-stroke"
//         />
//         {/* bright glowing accent along the bottom-right edge */}
//         <polyline
//           points={`100,${100 - CUT.br - 3} 100,${100 - CUT.br} ${100 - CUT.br},100 30,100`}
//           fill="none"
//           stroke="#eafcff"
//           strokeWidth={1.5}
//           vectorEffect="non-scaling-stroke"
//           style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
//         />
//         {/* bright tab on the right edge */}
//         <line
//           x1="100"
//           y1="26"
//           x2="100"
//           y2="38"
//           stroke="#eafcff"
//           strokeWidth={2}
//           vectorEffect="non-scaling-stroke"
//           style={{ filter: 'drop-shadow(0 0 3px rgba(190, 245, 250, 0.9))' }}
//         />
//         {/* ruler-style ticks along the left edge */}
//         {[58, 64, 70, 76, 82].map((y) => (
//           <line
//             key={y}
//             x1="0"
//             y1={y}
//             x2="3.2"
//             y2={y}
//             stroke="rgba(220, 245, 248, 0.8)"
//             strokeWidth={1.2}
//             vectorEffect="non-scaling-stroke"
//           />
//         ))}
//       </svg>
//     </div>
//   )
// }


// src/components/AnimationInfoPanel.tsx
import { useEffect, useState, type CSSProperties } from 'react'
import { useMobile } from '../hooks/useMobile'

interface InfoSection {
  /** Section label, e.g. "Mission Brief", "Under the Hood" — your call, it's just a heading. */
  heading: string
  /** Paragraph body. Use this OR `items`, not both. */
  content?: string
  /** Bullet list body. Use this OR `content`, not both. */
  items?: string[]
}

interface AnimationInfoPanelProps {
  title: string
  description?: InfoSection
  /** Short one-line hook / tagline, shown right under the title. */
  hook?: string
  /** "What it is" — name the heading yourself, e.g. "Overview" / "Mission Brief". */
  overview?: InfoSection
  /** "How it works" — name the heading yourself, e.g. "Under the Hood" / "How It Runs". */
  howItWorks?: InfoSection
  /** Tech stack tags, e.g. ['React', 'Three.js', 'Blender']. */
  techStack?: string[]
  /** Optional label for the tech stack heading. Defaults to "Built With". */
  techStackHeading?: string
  /** Link to a live demo/project — button only renders when this is set. */
  demoUrl?: string
  demoLabel?: string
  visible: boolean
  onClose: () => void
}

// Corner chamfer sizes as % of box width/height (top-left, top-right, bottom-right, bottom-left)
const CUT = { tl: 6, tr: 4, br: 9, bl: 4 }

const CLIP_PATH = `polygon(${CUT.tl}% 0, ${100 - CUT.tr}% 0, 100% ${CUT.tr}%, 100% ${
  100 - CUT.br
}%, ${100 - CUT.br}% 100%, ${CUT.bl}% 100%, 0 ${100 - CUT.bl}%, 0 ${CUT.tl}%)`

const FRAME_POINTS = `${CUT.tl},0 ${100 - CUT.tr},0 100,${CUT.tr} 100,${100 - CUT.br} ${
  100 - CUT.br
},100 ${CUT.bl},100 0,${100 - CUT.bl} 0,${CUT.tl} ${CUT.tl},0`

const sectionHeadingStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(190, 240, 245, 0.85)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const sectionHeadingRuleStyle: CSSProperties = {
  flex: 1,
  height: 1,
  background:
    'linear-gradient(90deg, rgba(190,240,245,0.35), rgba(190,240,245,0))',
}

const sectionBodyStyle: CSSProperties = {
  marginTop: 6,
  fontSize: 12,
  lineHeight: 1.6,
  letterSpacing: '0.01em',
  color: 'rgba(210, 238, 240, 0.75)',
  fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
  textAlign: 'left',
}

// Renders a heading + (paragraph or bullet list). Returns null if there's nothing to show.
function Section({ heading, content, items }: InfoSection) {
  if (!content && (!items || items.length === 0)) return null

  return (
    <div style={{ marginTop: 16 }}>
      <div style={sectionHeadingStyle}>
        <span>{heading}</span>
        <span style={sectionHeadingRuleStyle} />
      </div>
      {content && <div style={sectionBodyStyle}>{content}</div>}
      {items && items.length > 0 && (
        <ul style={{ ...sectionBodyStyle, margin: '6px 0 0', paddingLeft: 16 }}>
          {items.map((item, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AnimationInfoPanel({
  title,
  description,
  hook,
  overview,
  howItWorks,
  techStack,
  techStackHeading = 'Built With',
  demoUrl,
  demoLabel = 'View Live Demo ↗',
  visible,
  onClose,
}: AnimationInfoPanelProps) {
  const { isMobile, isTablet } = useMobile()
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(window.matchMedia('(pointer: coarse)').matches)
  }, [])

  const isMobileLayout = isMobile || (isTablet && isTouch)

  // Mobile: full-width at top with safe area inset, larger touch targets
  // Desktop: current top-right design
  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    top: isMobileLayout ? 'env(safe-area-inset-top, 0px)' : '5%',
    left: isMobileLayout ? 0 : 'auto',
    right: isMobileLayout ? 0 : '0%',
    transform: isMobileLayout
      ? `translateX(0) scale(${visible ? 1 : 0.98})`
      : `translateX(-5%) scale(${visible ? 1 : 0.98})`,
    opacity: visible ? 0.75 : 0,
    transition: 'opacity 0.6s ease, transform 0.6s ease',
    pointerEvents: 'none', // wrapper stays click-through; interactive children re-enable themselves below
    minWidth: isMobileLayout ? 0 : 320,
    maxWidth: isMobileLayout ? 'none' : 320,
    width: isMobileLayout ? '100%' : undefined,
    paddingTop: isMobileLayout ? 'env(safe-area-inset-top, 0px)' : 0,
    filter: 'drop-shadow(0 0 18px rgba(80, 190, 200, 0.25))',
    zIndex: 200,
  }

  const panelStyle: CSSProperties = {
    position: 'relative',
    padding: isMobileLayout ? '18px 20px' : '22px 26px',
    maxHeight: isMobileLayout ? 'calc(100vh - env(safe-area-inset-top, 0px) - 60px)' : 'none',
    overflow: isMobileLayout ? 'auto' : 'visible',
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
    textAlign: isMobileLayout ? 'left' : 'center',
  }

  const closeButtonStyle: CSSProperties = {
    position: 'absolute',
    top: isMobileLayout ? 14 : 10,
    right: isMobileLayout ? 18 : 14,
    width: isMobileLayout ? 36 : 20,
    height: isMobileLayout ? 36 : 20,
    minWidth: isMobileLayout ? 36 : undefined,
    minHeight: isMobileLayout ? 36 : undefined,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    borderRadius: 4,
    color: 'rgba(210, 238, 240, 0.6)',
    fontSize: isMobileLayout ? 18 : 14,
    lineHeight: 1,
    cursor: 'pointer',
    pointerEvents: visible ? 'auto' : 'none', // only clickable while panel is actually visible
    transition: 'color 0.2s ease, background 0.2s ease',
    touchAction: 'manipulation',
  }

  const demoButtonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 18,
    padding: isMobileLayout ? '12px 24px' : '8px 18px',
    fontSize: isMobileLayout ? 12 : 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#0b1b24',
    background: '#eafcff',
    border: 'none',
    borderRadius: 3,
    textDecoration: 'none',
    cursor: 'pointer',
    pointerEvents: visible ? 'auto' : 'none',
    boxShadow: '0 0 10px rgba(190, 245, 250, 0.5)',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    minHeight: isMobileLayout ? 44 : undefined,
    touchAction: 'manipulation',
  }

  const tagStyle: CSSProperties = {
    display: 'inline-block',
    padding: isMobileLayout ? '6px 12px' : '3px 9px',
    margin: '0 6px 6px 0',
    fontSize: isMobileLayout ? 11 : 10,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: 'rgba(220, 245, 248, 0.9)',
    background: 'rgba(170, 230, 235, 0.1)',
    border: '1px solid rgba(180, 235, 240, 0.3)',
    borderRadius: 3,
    touchAction: 'manipulation',
  }

  return (
    <div style={wrapperStyle}>
      <div style={panelStyle}>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#eafcff'
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(210, 238, 240, 0.6)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          ✕
        </button>

        {/* Title */}
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

        {/* One-line hook */}
        {hook && (
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.5,
              letterSpacing: '0.01em',
              color: 'rgba(210, 238, 240, 0.7)',
              fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
            }}
          >
            {hook}
          </div>
        )}

        {description && <Section {...description} />}


        {/* "What it is" — heading name is yours to choose via overview.heading */}
        {overview && <Section {...overview} />}

        {/* "How it works" — heading name is yours to choose via howItWorks.heading */}
        {howItWorks && <Section {...howItWorks} />}

        {/* Tech stack tags */}
        {techStack && techStack.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={sectionHeadingStyle}>
              <span>{techStackHeading}</span>
              <span style={sectionHeadingRuleStyle} />
            </div>
            <div style={{ marginTop: 8, textAlign: 'left' }}>
              {techStack.map((tech) => (
                <span key={tech} style={tagStyle}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Demo link — only rendered when a URL is provided */}
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={demoButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 0 16px rgba(190, 245, 250, 0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 0 10px rgba(190, 245, 250, 0.5)'
            }}
          >
            {demoLabel}
          </a>
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