// src/interaction/touchInput.ts
// Shared, mutable joystick state.
//
// VirtualJoystick (DOM, outside <Canvas>) WRITES to this object from pointer handlers.
// WalkControls (inside <Canvas>) READS it every frame in useFrame.
//
// A plain object is used on purpose instead of React state/context:
//  - no re-render per pointer move,
//  - no dependency on where a Provider sits relative to <Canvas>.
//
// All values are normalized to [-1, 1].
export const touchInput = {
  /** Strafe: +1 = right, -1 = left */
  moveX: 0,
  /** Forward/back: +1 = forward, -1 = backward */
  moveY: 0,
  /** Look yaw rate: +1 = look right */
  lookX: 0,
  /** Look pitch rate: +1 = look up */
  lookY: 0,
}

export function resetTouchInput() {
  touchInput.moveX = 0
  touchInput.moveY = 0
  touchInput.lookX = 0
  touchInput.lookY = 0
}