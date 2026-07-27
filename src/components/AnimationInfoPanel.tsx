// src/components/AnimationInfoPanel.tsx
interface AnimationInfoPanelProps {
  title: string
  subtitle?: string
  visible: boolean
}

export default function AnimationInfoPanel({ title, subtitle, visible }: AnimationInfoPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '5%',
        right: '2%',
        transform: `translateY(-50%) translateX(${visible ? '0' : '16px'})`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.6s ease, transform 0.6s ease',
        pointerEvents: 'none',
        maxWidth: 280,
        padding: '20px 24px',
        borderRadius: 10,
        background: 'rgba(26, 26, 46, 0.55)', // matches scene bg (#1a1a2e), semi-transparent
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#fff',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: 0.2 }}>{title}</div>
      {subtitle && (
        <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5, color: 'rgba(255,255,255,0.75)' }}>
          {subtitle}
        </div>
      )}
    </div>
  )
}