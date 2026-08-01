import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const COLLISION_DAMPING = 10 // higher = snappier correction, lower = softer push-back

export function useCameraCollision(
  collisionMeshRef: React.RefObject<THREE.Object3D | null>,
  origin: [number, number, number] = [0, 0, 0],
  margin = 0.3
) {
  const { camera } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const originVec = useRef(new THREE.Vector3(...origin))
  const direction = useRef(new THREE.Vector3())
  const clampedPos = useRef(new THREE.Vector3())

  useEffect(() => {
    originVec.current.set(...origin)
  }, [origin])

  useFrame((_, delta) => {
    if (!collisionMeshRef.current) return

    direction.current.subVectors(camera.position, originVec.current) // origin → camera
    const distance = direction.current.length()
    direction.current.normalize()

    raycaster.current.set(originVec.current, direction.current)
    raycaster.current.far = distance

    const hits = raycaster.current.intersectObject(collisionMeshRef.current, true)

    if (hits.length > 0 && hits[0].distance < distance) {
      clampedPos.current.copy(originVec.current).add(
        direction.current.multiplyScalar(Math.max(hits[0].distance - margin, 0.1))
      )
      const alpha = 1 - Math.exp(-COLLISION_DAMPING * delta)
      camera.position.lerp(clampedPos.current, alpha)
    }
  })
}