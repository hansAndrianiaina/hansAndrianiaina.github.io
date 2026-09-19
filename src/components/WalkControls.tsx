// components/WalkControls.tsx
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { touchInput } from '../interaction/touchInput'

const SPEED = 3
const LOOK_SENSITIVITY = 0.0025
const JOYSTICK_LOOK_SPEED = 2.2   // rad/s at full right-stick deflection
const MAX_PITCH = Math.PI / 2 - 0.05
const LOOK_DAMPING = 8      // higher = snappier, lower = floatier
const MOVE_DAMPING = 6      // higher = more responsive stop/start, lower = more glide

export default function WalkControls() {
  const { camera, gl } = useThree()
  const keys = useRef({ forward: false, backward: false, left: false, right: false })

  // The pointer currently dragging to look (mouse / pen only). null = not dragging.
  // Tracking the id keeps a second finger / pointer from corrupting the drag delta.
  const activePointerId = useRef<number | null>(null)
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
      // On touch screens, look is driven by the right joystick (see VirtualJoystick),
      // so a finger on the canvas must not also rotate the camera.
      if (e.pointerType === 'touch') return
      if (activePointerId.current !== null) return
      activePointerId.current = e.pointerId
      lastPointer.current = { x: e.clientX, y: e.clientY }
      dom.style.cursor = 'grabbing'
    }
    // Shared by pointerup AND pointercancel so a cancelled gesture can't leave the drag stuck on.
    const endDrag = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return
      activePointerId.current = null
      dom.style.cursor = 'auto'
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId.current) return
      const dx = e.clientX - lastPointer.current.x
      const dy = e.clientY - lastPointer.current.y
      lastPointer.current = { x: e.clientX, y: e.clientY }

      targetYaw.current -= dx * LOOK_SENSITIVITY
      targetPitch.current -= dy * LOOK_SENSITIVITY
      targetPitch.current = THREE.MathUtils.clamp(targetPitch.current, -MAX_PITCH, MAX_PITCH)
    }

    dom.style.cursor = 'auto'
    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)

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
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      dom.style.cursor = 'auto'
    }
  }, [gl])

  useFrame((_, delta) => {
    // --- right joystick look (rate-based: holding the stick keeps turning) ---
    if (touchInput.lookX !== 0 || touchInput.lookY !== 0) {
      targetYaw.current -= touchInput.lookX * JOYSTICK_LOOK_SPEED * delta
      targetPitch.current = THREE.MathUtils.clamp(
        targetPitch.current + touchInput.lookY * JOYSTICK_LOOK_SPEED * delta,
        -MAX_PITCH,
        MAX_PITCH,
      )
    }

    // --- damped look ---
    const lookAlpha = 1 - Math.exp(-LOOK_DAMPING * delta) // frame-rate independent smoothing
    currentYaw.current = THREE.MathUtils.lerp(currentYaw.current, targetYaw.current, lookAlpha)
    currentPitch.current = THREE.MathUtils.lerp(currentPitch.current, targetPitch.current, lookAlpha)
    camera.quaternion.setFromEuler(new THREE.Euler(currentPitch.current, currentYaw.current, 0, 'YXZ'))

    // --- damped movement ---
    // Start from the left joystick (analog, -1..1), then add keyboard (digital).
    targetVelocity.current.set(touchInput.moveX, 0, -touchInput.moveY)
    if (keys.current.forward) targetVelocity.current.z -= 1
    if (keys.current.backward) targetVelocity.current.z += 1
    if (keys.current.left) targetVelocity.current.x -= 1
    if (keys.current.right) targetVelocity.current.x += 1
    // Clamp to unit length: keyboard diagonals are still normalized like before,
    // while a half-pushed joystick keeps its partial speed.
    if (targetVelocity.current.lengthSq() > 1) targetVelocity.current.normalize()
    targetVelocity.current.multiplyScalar(SPEED)
    targetVelocity.current.applyQuaternion(camera.quaternion)
    targetVelocity.current.y = 0

    const moveAlpha = 1 - Math.exp(-MOVE_DAMPING * delta)
    currentVelocity.current.lerp(targetVelocity.current, moveAlpha)
    camera.position.addScaledVector(currentVelocity.current, delta)
  })

  return null
}