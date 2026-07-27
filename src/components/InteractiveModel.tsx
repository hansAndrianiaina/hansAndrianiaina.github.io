// src/components/InteractiveModel.tsx
import { useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { Model } from './Model'
import { INTERACTABLES } from '../interaction/interactables'
import { useDidDrag } from '../interaction/DragGuardContext'

const HOVER_COLOR = new THREE.Color('#ffffff')
const HOVER_INTENSITY = 0.35

export default function InteractiveModel({ onSelect }: { onSelect: (name: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const didDragRef = useDidDrag()
  const [, setHovered] = useState<string | null>(null)
  const originalEmissive = useRef<Map<THREE.Material, THREE.Color>>(new Map())

  // Clone materials for interactive meshes only, so hover doesn't bleed
  // into other meshes sharing the same material instance.
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh && INTERACTABLES[obj.name]) {
        const mat = obj.material as THREE.MeshStandardMaterial
        const cloned = mat.clone()
        obj.material = cloned
        originalEmissive.current.set(cloned, cloned.emissive.clone())
      }
    })
  }, [])

  const setEmissive = (activeName: string | null) => {
    groupRef.current?.traverse((obj) => {
      if (obj instanceof THREE.Mesh && INTERACTABLES[obj.name]) {
        const mat = obj.material as THREE.MeshStandardMaterial
        if (obj.name === activeName) {
          mat.emissive = HOVER_COLOR
          mat.emissiveIntensity = HOVER_INTENSITY
        } else {
          const orig = originalEmissive.current.get(mat)
          mat.emissive = orig ? orig.clone() : new THREE.Color('#000000')
          mat.emissiveIntensity = 0
        }
      }
    })
  }

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!INTERACTABLES[e.object.name]) return
    e.stopPropagation()
    setHovered(e.object.name)
    setEmissive(e.object.name)
    document.body.style.cursor = 'pointer'
  }, [])

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!INTERACTABLES[e.object.name]) return
    e.stopPropagation()
    setHovered(null)
    setEmissive(null)
    document.body.style.cursor = 'auto'
  }, [])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!INTERACTABLES[e.object.name]) return
    e.stopPropagation()
    if (didDragRef.current) return // swallow the click that ended a drag
    onSelect(e.object.name)
  }, [onSelect, didDragRef])

  return (
    <group ref={groupRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
      <Model />
    </group>
  )
}