import { useRoomLighting } from '../hooks/useRoomLighting'

// Same positions as the round_lamp meshes in Model.tsx
const LAMP_POSITIONS: [number, number, number][] = [
  [0, 1.9, -2.227],
  [1, 1.9, -2.227],
  [-1, 1.9, -2.227],
  [0, 1.9, 2.207],
  [1, 1.9, 2.207],
  [-1, 1.9, 2.207],
]

// Baseline values at intensity = 1
const BASE_HEMI_INTENSITY = 0.35
const BASE_POINT_INTENSITY = 0.8

export default function RoomLighting() {
  const { intensity, enabled } = useRoomLighting()

  const actualIntensity = enabled ? intensity : 0

  return (
    <>
      <hemisphereLight
        args={[
          '#ffffff',
          '#3a3a3a',
          BASE_HEMI_INTENSITY * actualIntensity,
        ]}
      />

      {LAMP_POSITIONS.map((pos, i) => (
        <pointLight
          key={i}
          position={pos}
          intensity={BASE_POINT_INTENSITY * actualIntensity}
          distance={4}
          decay={2}
        />
      ))}
    </>
  )
}