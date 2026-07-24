// components/ControlModeToggle.tsx
type ControlMode = 'orbit' | 'walk'

export default function ControlModeToggle({
  mode,
  onChange,
}: {
  mode: ControlMode
  onChange: (m: ControlMode) => void
}) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        display: 'flex',
        gap: 8,
        fontFamily: 'sans-serif',
        fontSize: 14,
      }}
    >
      <button
        onClick={() => onChange('orbit')}
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          background: mode === 'orbit' ? '#fff' : 'rgba(255,255,255,0.2)',
          color: mode === 'orbit' ? '#111' : '#fff',
        }}
      >
        Orbit
      </button>
      <button
        onClick={() => onChange('walk')}
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer',
          background: mode === 'walk' ? '#fff' : 'rgba(255,255,255,0.2)',
          color: mode === 'walk' ? '#111' : '#fff',
        }}
      >
        Walk
      </button>
    </div>
  )
}