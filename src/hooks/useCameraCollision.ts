// hooks/useCameraCollision.ts
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function useCameraCollision(
  collisionMeshRef: React.RefObject<THREE.Object3D>,
  origin: [number, number, number] = [0, 0, 0],
  margin = 0.3
) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const originVec = useRef(new THREE.Vector3(...origin))

  useFrame(() => {
    if (!collisionMeshRef.current) return

    const direction = new THREE.Vector3().subVectors(camera.position, originVec.current)
    const distance = direction.length()
    direction.normalize()

    raycaster.current.set(originVec.current, direction)
    raycaster.current.far = distance

    const hits = raycaster.current.intersectObject(collisionMeshRef.current, true)

    if (hits.length > 0 && hits[0].distance < distance) {
      const clamped = originVec.current.clone().add(
        direction.multiplyScalar(Math.max(hits[0].distance - margin, 0.1))
      )
      camera.position.copy(clamped)
    }
  })
}