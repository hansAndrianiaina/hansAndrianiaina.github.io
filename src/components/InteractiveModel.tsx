// src/components/InteractiveModel.tsx
import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Model } from './Model'
import { INTERACTABLES } from '../interaction/interactables'
import { useDidDrag } from '../interaction/DragGuardContext'
import { useSoundPlayer } from './SoundPlayer';

const HOVER_COLOR = new THREE.Color('#ffffff')
const HOVER_INTENSITY = 0.35

const BOB_SPEED = 1      // radians/s; lower = slower (one full cycle takes 2π / speed seconds)
const BOB_AMPLITUDE = 0.01  // scene units (the pots sit at about y = 0.26, so keep this small)

// Pre-compute which mesh names are interactive for faster lookup
const INTERACTABLE_NAMES = new Set(Object.keys(INTERACTABLES))

export default function InteractiveModel({ onSelect }: { onSelect: (name: string) => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const robotRef = useRef<THREE.Object3D | null>(null)
  const potPartsRef = useRef<{ mesh: THREE.Object3D; baseY: number; phase: number }[] | null>(null)

  const didDragRef = useDidDrag()
  const [, setHovered] = useState<string | null>(null)
  const originalEmissive = useRef<Map<THREE.Material, THREE.Color>>(new Map())

  const { play } = useSoundPlayer(import.meta.env.BASE_URL + 'sounds/click.mp3', { volume: 0.5 });

  // Clone materials for interactive meshes only - runs once on mount
  // Use useMemo with empty deps to ensure it only runs once
  const interactiveMeshes = useMemo((): THREE.Mesh[] => {
    const meshes: THREE.Mesh[] = []
    groupRef.current?.traverse((obj) => {
      if (obj instanceof THREE.Mesh && INTERACTABLE_NAMES.has(obj.name)) {
        meshes.push(obj)
      }
    })
    return meshes
  }, [])

  useFrame(({ clock }, delta) => {
    const root = groupRef.current
    if (!root) return

    // robot spin
    if (!robotRef.current) {
      robotRef.current = root.getObjectByName('robot') ?? null
    }
    if (robotRef.current) robotRef.current.rotation.y += delta * 0.5

    // pot bobbing: lazy lookup, runs once
    if (!potPartsRef.current) {
      const parts: { mesh: THREE.Object3D; baseY: number; phase: number }[] = []
      let potIndex = 0
      root.traverse((obj) => {
        if (/^pot\d*$/.test(obj.name)) {
          for (const child of obj.children) {
            if (child instanceof THREE.Mesh) {   // direct meshes only, skips the Icosphere group
              parts.push({ mesh: child, baseY: child.position.y, phase: potIndex })
            }
          }
          potIndex++
        }
      })
      potPartsRef.current = parts
    }

    const t = clock.elapsedTime
    for (const { mesh, baseY, phase } of potPartsRef.current) {
      mesh.position.y = baseY + Math.sin(t * BOB_SPEED + phase) * BOB_AMPLITUDE
    }
  })

  // Initialize material clones once
  useEffect(() => {
    for (const mesh of interactiveMeshes) {
      const mat = mesh.material as THREE.MeshStandardMaterial
      const cloned = mat.clone()
      mesh.material = cloned
      originalEmissive.current.set(cloned, cloned.emissive.clone())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Run once on mount

  const setEmissive = useCallback((activeName: string | null) => {
    for (const mesh of interactiveMeshes) {
      const mat = mesh.material as THREE.MeshStandardMaterial
      if (mesh.name === activeName) {
        mat.emissive = HOVER_COLOR
        mat.emissiveIntensity = HOVER_INTENSITY
      } else {
        const orig = originalEmissive.current.get(mat)
        mat.emissive = orig ? orig.clone() : new THREE.Color('#000000')
        mat.emissiveIntensity = 0
      }
    }
  }, [interactiveMeshes])

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!INTERACTABLE_NAMES.has(e.object.name)) return
    e.stopPropagation()
    setHovered(e.object.name)
    setEmissive(e.object.name)
    document.body.style.cursor = 'pointer'
  }, [setEmissive])

  const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
    if (!INTERACTABLE_NAMES.has(e.object.name)) return
    e.stopPropagation()
    setHovered(null)
    setEmissive(null)
    document.body.style.cursor = 'auto'
  }, [setEmissive])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    if (!INTERACTABLE_NAMES.has(e.object.name)) return
    e.stopPropagation()
    if (didDragRef.current) return // swallow the click that ended a drag
    play(); // Play click sound on selection
    onSelect(e.object.name)
  }, [onSelect, didDragRef])

  return (
    <group ref={groupRef} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
      <Model />
    </group>
  )
}