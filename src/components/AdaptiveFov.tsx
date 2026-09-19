// src/components/AdaptiveFov.tsx
// Not in the original plan, but needed for phones.
//
// The camera's `fov` is VERTICAL. On a portrait phone (aspect ~0.46) a 45° vertical FOV
// is only ~23° horizontally: the room looks like a keyhole. Below aspect 1 we widen the
// vertical FOV so the horizontal FOV stays at what a 1:1 view would give, capped so the
// perspective distortion stays reasonable. Landscape / desktop stays at 45°.
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const BASE_FOV = 45
const MAX_FOV = 80

export default function AdaptiveFov() {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return

    let fov = BASE_FOV
    if (aspect < 1) {
      const halfBase = THREE.MathUtils.degToRad(BASE_FOV) / 2
      const widened = 2 * Math.atan(Math.tan(halfBase) / aspect)
      fov = Math.min(THREE.MathUtils.radToDeg(widened), MAX_FOV)
    }

    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  return null
}