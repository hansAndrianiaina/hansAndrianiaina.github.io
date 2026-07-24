// components/IntroCamera.tsx
import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useIntroCameraDebug } from './IntroCameraControls'

export default function IntroCamera({ onComplete }: { onComplete?: () => void }) {
  const { camera } = useThree()
  const { start, end, duration } = useIntroCameraDebug()
  const progress = useRef(0)
  const [done, setDone] = useState(false)

  useFrame((_, delta) => {
    if (done) return
    progress.current = Math.min(progress.current + delta / duration, 1)
    const eased = 1 - Math.pow(1 - progress.current, 3)

    camera.position.lerpVectors(
      new THREE.Vector3(...start),
      new THREE.Vector3(...end),
      eased
    )
    camera.lookAt(0, 0, 0)

    if (progress.current === 1) {
      setDone(true)
      onComplete?.()
    }
  })

  return null
}