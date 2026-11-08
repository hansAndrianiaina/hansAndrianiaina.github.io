
// src/hooks/useRobotCompanion.ts
import { useCallback, useMemo, useRef } from 'react'
import type { RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const ROBOT_NAME = 'robot'

// Where the robot parks relative to the clicked object
const MIN_Y = 0.6
const MAX_Y = 1.7

// Travel feel
const MAX_SPEED = 2.5
const ARRIVE_GAIN = 3
const ACCEL = 4
const ARRIVE_DIST = 0.05

// Rotation
const TURN_SPEED = 2.5 // radians / second
const TURN_TOLERANCE = THREE.MathUtils.degToRad(3)

// Set to Math.PI if the robot model faces local -Z instead of +Z
const ROBOT_YAW_OFFSET = 0

// Idle hover
const BOB_SPEED = 2
const BOB_AMPLITUDE = 0.02

const ROBOT_RADIUS = 0.2     // rough size of the robot incl. hover bob
const SIDE_MARGIN = 0.15     // gap between object edge and robot
const PREFERRED_SIDE = -1    // -1 = screen-left (info panel is on the right), 1 = right
const LIFT = 0.15            // hover slightly above the object's center
const ROOM_HALF_X = 2.2      // tune to your room; used to reject out-of-room spots
const ROOM_HALF_Z = 2.8

const MAX_HALF_WIDTH = 0.6   // cap so wide objects don't push the robot far away
const WALL_MARGIN = 0.35     // keep the robot this far from the walls

type MotionPhase = 'idle' | 'turning' | 'moving'

interface Options {
  returnDelay?: number
}

export function useRobotCompanion(
  groupRef: RefObject<THREE.Group | null>,
  { returnDelay = 5 }: Options = {}
) {
  const camera = useThree((s) => s.camera)
  const clock = useThree((s) => s.clock)

  const robot = useRef<THREE.Object3D | null>(null)

  // All positions are in the robot's parent-local space
  const home = useRef(new THREE.Vector3())
  const base = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  const velocity = useRef(new THREE.Vector3())

  // Movement state
  const phase = useRef<MotionPhase>('idle')
  const away = useRef(false)
  const arrived = useRef(true)
  const lastActive = useRef(0)



  // Reusable objects to avoid allocations every frame
  const tmp = useMemo(
    () => ({
      box: new THREE.Box3(),
      center: new THREE.Vector3(),
      size: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
      desired: new THREE.Vector3(),
      cameraWorld: new THREE.Vector3(),
      cameraLocal: new THREE.Vector3(),
      right: new THREE.Vector3(),
      candidate: new THREE.Vector3(),
    }),
    []
  )

  useFrame((_, delta) => {
    const root = groupRef.current
    if (!root) return

    // Lazy robot lookup
    if (!robot.current) {
      const r = root.getObjectByName(ROBOT_NAME)
      if (!r) return

      robot.current = r

      home.current.copy(r.position)
      base.current.copy(r.position)
      target.current.copy(r.position)
    }

    const r = robot.current
    if (!r.parent) return

    const dt = Math.min(delta, 0.05)
    const now = clock.elapsedTime

    // --------------------------------------------------
    // 1. Inactivity -> return home
    // --------------------------------------------------

    if (
      away.current &&
      arrived.current &&
      now - lastActive.current > returnDelay
    ) {
      target.current.copy(home.current)

      away.current = false
      arrived.current = false

      velocity.current.set(0, 0, 0)
      phase.current = 'turning'
    }

    // --------------------------------------------------
    // 2. TURNING: rotate towards the destination first
    // --------------------------------------------------

    if (phase.current === 'turning') {
      tmp.toTarget.subVectors(target.current, base.current)

      const dist = tmp.toTarget.length()

      if (dist <= ARRIVE_DIST) {
        // Already close enough to the destination
        base.current.copy(target.current)
        velocity.current.set(0, 0, 0)

        phase.current = 'idle'
        arrived.current = true
        lastActive.current = now
      } else {
        // Desired horizontal direction
        tmp.dir.copy(tmp.toTarget)
        tmp.dir.y = 0
        tmp.dir.normalize()

        // Calculate the required yaw
        const desiredYaw =
          Math.atan2(tmp.dir.x, tmp.dir.z) + ROBOT_YAW_OFFSET

        // Shortest angular distance to the desired orientation
        const yawDiff = Math.atan2(
          Math.sin(desiredYaw - r.rotation.y),
          Math.cos(desiredYaw - r.rotation.y)
        )

        // Rotate without moving
        r.rotation.y += THREE.MathUtils.clamp(
          yawDiff,
          -TURN_SPEED * dt,
          TURN_SPEED * dt
        )

        // Start moving only when sufficiently aligned
        if (Math.abs(yawDiff) <= TURN_TOLERANCE) {
          r.rotation.y = desiredYaw
          phase.current = 'moving'
        }
      }
    }

    // --------------------------------------------------
    // 3. MOVING: translate after completing the turn
    // --------------------------------------------------

    else if (phase.current === 'moving') {
      tmp.toTarget.subVectors(target.current, base.current)

      const dist = tmp.toTarget.length()

      if (dist <= ARRIVE_DIST) {
        base.current.copy(target.current)
        velocity.current.set(0, 0, 0)

        phase.current = 'idle'
        arrived.current = true
        lastActive.current = now
      } else {
        // Desired velocity with gradual braking near the target
        const speed = Math.min(MAX_SPEED, dist * ARRIVE_GAIN)

        tmp.desired
          .copy(tmp.toTarget)
          .multiplyScalar(speed / dist)

        // Smooth acceleration and deceleration
        velocity.current.lerp(
          tmp.desired,
          1 - Math.exp(-ACCEL * dt)
        )

        const stepDistance = velocity.current.length() * dt

        // Prevent overshooting the destination
        if (stepDistance >= dist) {
          base.current.copy(target.current)
          velocity.current.set(0, 0, 0)

          phase.current = 'idle'
          arrived.current = true
          lastActive.current = now
        } else {
          base.current.addScaledVector(velocity.current, dt)

          if (
            base.current.distanceToSquared(target.current) <=
            ARRIVE_DIST * ARRIVE_DIST
          ) {
            base.current.copy(target.current)
            velocity.current.set(0, 0, 0)

            phase.current = 'idle'
            arrived.current = true
            lastActive.current = now
          }
        }
      }
    }

    // --------------------------------------------------
    // 4. IDLE: gradually face the camera
    // --------------------------------------------------

    else {
      velocity.current.set(0, 0, 0)

      // Get camera position in the robot's parent-local space
      camera.getWorldPosition(tmp.cameraWorld)

      tmp.cameraLocal.copy(tmp.cameraWorld)
      r.parent.worldToLocal(tmp.cameraLocal)

      // Horizontal direction from robot towards camera
      tmp.dir.subVectors(tmp.cameraLocal, base.current)
      tmp.dir.y = 0

      if (tmp.dir.lengthSq() > 1e-6) {
        tmp.dir.normalize()

        const desiredYaw =
          Math.atan2(tmp.dir.x, tmp.dir.z) + ROBOT_YAW_OFFSET

        const yawDiff = Math.atan2(
          Math.sin(desiredYaw - r.rotation.y),
          Math.cos(desiredYaw - r.rotation.y)
        )

        // Smoothly face the camera
        r.rotation.y += THREE.MathUtils.clamp(
          yawDiff,
          -TURN_SPEED * dt,
          TURN_SPEED * dt
        )
      }
    }

    // --------------------------------------------------
    // 5. Hover animation
    // --------------------------------------------------

    r.position.copy(base.current)
    r.position.y += Math.sin(now * BOB_SPEED) * BOB_AMPLITUDE
  })

  /**
   * Fly next to an object, on the side facing the camera.
   * Clicking the robot itself only resets the inactivity timer.
   */
  const goTo = useCallback(
    (object: THREE.Object3D) => {
      const r = robot.current
      if (!r?.parent) return

      // Ignore clicks on the robot or its children
      for (let o: THREE.Object3D | null = object; o; o = o.parent) {
        if (o === r) {
          lastActive.current = clock.elapsedTime
          return
        }
      }

      tmp.box.setFromObject(object)
      tmp.box.getCenter(tmp.center)
      tmp.box.getSize(tmp.size)

      // Horizontal camera -> object direction
      tmp.dir.subVectors(tmp.center, camera.position)
      tmp.dir.y = 0
      if (tmp.dir.lengthSq() < 1e-6) tmp.dir.set(0, 0, -1)
      tmp.dir.normalize()

      // Screen-right axis (dir x up)
      tmp.right.set(-tmp.dir.z, 0, tmp.dir.x)

      const halfWidth = Math.min(
        (Math.abs(tmp.right.x) * tmp.size.x + Math.abs(tmp.right.z) * tmp.size.z) / 2,
        MAX_HALF_WIDTH
      )
      const offset = halfWidth + ROBOT_RADIUS + SIDE_MARGIN

      const limitX = ROOM_HALF_X - WALL_MARGIN
      const limitZ = ROOM_HALF_Z - WALL_MARGIN
      const inRoom = (v: THREE.Vector3) =>
        Math.abs(v.x) <= limitX && Math.abs(v.z) <= limitZ

      // Candidate positions for one side, optionally pulled toward the camera
      const build = (side: number, pull: number, out: THREE.Vector3) =>
        out
          .copy(tmp.center)
          .addScaledVector(tmp.right, side * offset)
          .addScaledVector(tmp.dir, -pull)

      let found = false
      // Try preferred side, then the other; for each, pull progressively toward the camera
      for (const side of [PREFERRED_SIDE, -PREFERRED_SIDE]) {
        for (const pull of [0.1, 0.3, 0.5, 0.8]) {
          build(side, pull, tmp.candidate)
          if (inRoom(tmp.candidate)) {
            found = true
            break
          }
        }
        if (found) break
      }

      // Last resort: take the preferred side and clamp it into the room
      if (!found) {
        build(PREFERRED_SIDE, 0.5, tmp.candidate)
        tmp.candidate.x = THREE.MathUtils.clamp(tmp.candidate.x, -limitX, limitX)
        tmp.candidate.z = THREE.MathUtils.clamp(tmp.candidate.z, -limitZ, limitZ)
      }

      tmp.candidate.y = tmp.center.y + LIFT
      tmp.center.copy(tmp.candidate)
      r.parent.worldToLocal(tmp.center)
      tmp.center.y = THREE.MathUtils.clamp(tmp.center.y, MIN_Y, MAX_Y)
      target.current.copy(tmp.center)

      // Always turn before moving, including when changing targets
      velocity.current.set(0, 0, 0)
      phase.current = 'turning'

      away.current = true
      arrived.current = false
      lastActive.current = clock.elapsedTime
    },
    [camera, clock, tmp]
  )

  return { goTo }
}
