import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useControls, monitor, button } from 'leva'

export default function CameraDebugPanel({ onReplay }: { onReplay?: () => void }) {
  const posRef = useRef({ x: 0, y: 0, z: 0 })

  useFrame(({ camera }) => {
    posRef.current = {
      x: Number(camera.position.x.toFixed(2)),
      y: Number(camera.position.y.toFixed(2)),
      z: Number(camera.position.z.toFixed(2)),
    }
  })

  useControls('Camera Position', {
    x: monitor(() => posRef.current.x, { interval: 100 }),
    y: monitor(() => posRef.current.y, { interval: 100 }),
    z: monitor(() => posRef.current.z, { interval: 100 }),
    'copy to clipboard': button(() => {
      navigator.clipboard.writeText(JSON.stringify(posRef.current))
    }),
  })

  useControls('Intro Camera', {
    'replay intro': button(() => onReplay?.()),
  })

  return null
}