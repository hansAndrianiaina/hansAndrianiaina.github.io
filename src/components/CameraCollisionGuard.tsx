// components/CameraCollisionGuard.tsx
import { useCameraCollision } from '../hooks/useCameraCollision'
import * as THREE from 'three'

export default function CameraCollisionGuard({
  targetRef,
}: {
  targetRef: React.RefObject<THREE.Object3D>
}) {
  useCameraCollision(targetRef, [0, 0, 0], 0.3)
  return null
}