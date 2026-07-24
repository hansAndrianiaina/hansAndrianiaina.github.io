// components/WalkControls.tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const SPEED = 3
const LOOK_SENSITIVITY = 0.0025
const MAX_PITCH = Math.PI / 2 - 0.05
const LOOK_DAMPING = 8      // higher = snappier, lower = floatier
const MOVE_DAMPING = 6      // higher = more responsive stop/start, lower = more glide

export default function WalkControls() {
  const { camera, gl } = useThree()
  const keys = useRef({ forward: false, backward: false, left: false, right: false })

  const isDragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  // targets = where input wants us to be, current = what's actually rendered (smoothed)
  const targetYaw = useRef(0)
  const targetPitch = useRef(0)
  const currentYaw = useRef(0)
  const currentPitch = useRef(0)

  const targetVelocity = useRef(new THREE.Vector3())
  const currentVelocity = useRef(new THREE.Vector3())

  useEffect(() => {
    const euler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ')
    targetYaw.current = currentYaw.current = euler.y
    targetPitch.current = currentPitch.current = euler.x
  }, [camera])

  useEffect(() => {
    const dom = gl.domElement

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
      dom.style.cursor = 'grabbing'
    }
    const onPointerUp = () => {
      isDragging.current = false
      dom.style.cursor = 'grab'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }

      targetYaw.current -= dx * LOOK_SENSITIVITY
      targetPitch.current -= dy * LOOK_SENSITIVITY
      targetPitch.current = THREE.MathUtils.clamp(targetPitch.current, -MAX_PITCH, MAX_PITCH)
    }

    dom.style.cursor = 'grab'
    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = true; break
        case 'KeyS': case 'ArrowDown': keys.current.backward = true; break
        case 'KeyA': case 'ArrowLeft': keys.current.left = true; break
        case 'KeyD': case 'ArrowRight': keys.current.right = true; break
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': keys.current.forward = false; break
        case 'KeyS': case 'ArrowDown': keys.current.backward = false; break
        case 'KeyA': case 'ArrowLeft': keys.current.left = false; break
        case 'KeyD': case 'ArrowRight': keys.current.right = false; break
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      dom.style.cursor = 'auto'
    }
  }, [gl])

  useFrame((_, delta) => {
    // --- damped look ---
    const lookAlpha = 1 - Math.exp(-LOOK_DAMPING * delta) // frame-rate independent smoothing
    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, lookAlpha)
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, lookAlpha)
    camera.quaternion.setFromEuler(new THREE.Euler(currentPitch.current, currentYaw.current, 0, 'YXZ'))

    // --- damped movement ---
    targetVelocity.current.set(0, 0, 0)
    if (keys.current.forward) targetVelocity.current.z -= 1
    if (keys.current.backward) targetVelocity.current.z += 1
    if (keys.current.left) targetVelocity.current.x -= 1
    if (keys.current.right) targetVelocity.current.x += 1
    if (targetVelocity.current.lengthSq() > 0) targetVelocity.current.normalize()
    targetVelocity.current.multiplyScalar(SPEED)
    targetVelocity.current.applyQuaternion(camera.quaternion)
    targetVelocity.current.y = 0

    const moveAlpha = 1 - Math.exp(-MOVE_DAMPING * delta)
    currentVelocity.current.lerp(targetVelocity.current, moveAlpha)
    camera.position.addScaledVector(currentVelocity.current, delta)
  })

  return null
}