// src/interaction/DragGuardContext.tsx
import { createContext, useContext, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useThree } from '@react-three/fiber'

const DragGuardContext = createContext<React.MutableRefObject<boolean> | null>(null)
const DRAG_THRESHOLD = 12 // px before a down->up counts as a drag, not a click

export function DragGuardProvider({ children }: { children: ReactNode }) {
  const didDragRef = useRef(false)
  const downPos = useRef({ x: 0, y: 0 })
  const { gl } = useThree()

  useEffect(() => {
    const dom = gl.domElement
    const controller = new AbortController()
    const options = { signal: controller.signal }

    const onPointerDown = (e: PointerEvent) => {
      didDragRef.current = false
      downPos.current = { x: e.clientX, y: e.clientY }
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.buttons === 0) return // no button held, not a drag
      const dx = e.clientX - downPos.current.x
      const dy = e.clientY - downPos.current.y
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) didDragRef.current = true
    }
    const onPointerUp = () => {
      // cleanup handled by AbortController
    }

    dom.addEventListener('pointerdown', onPointerDown, options)
    window.addEventListener('pointermove', onPointerMove, options)
    window.addEventListener('pointerup', onPointerUp, options)

    return () => {
      controller.abort()
      dom.style.cursor = 'auto'
    }
  }, [gl])

  return <DragGuardContext.Provider value={didDragRef}>{children}</DragGuardContext.Provider>
}

export function useDidDrag() {
  const ctx = useContext(DragGuardContext)
  if (!ctx) throw new Error('useDidDrag must be used within DragGuardProvider')
  return ctx
}