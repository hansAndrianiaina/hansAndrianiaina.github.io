// components/IntroCamera.tsx
import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const START: [number, number, number] = [0, 0.2, 3]
const END: [number, number, number] = [0, 0.1, 2]
const DURATION = 2

export default function IntroCamera({ onComplete }: { onComplete?: () => void }) {
  const { camera } = useThree()
  const progress = useRef(0)
  const [done, setDone] = useState(false)

  useFrame((_, delta) => {
    if (done) return
    progress.current = Math.min(progress.current + delta / DURATION, 1)
    const eased = 1 - Math.pow(1 - progress.current, 3)

    camera.position.lerpVectors(
      new THREE.Vector3(...START),
      new THREE.Vector3(...END),
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