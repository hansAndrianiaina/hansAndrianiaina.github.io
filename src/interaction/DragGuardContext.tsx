// src/interaction/DragGuardContext.tsx
import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { useThree } from '@react-three/fiber'

const DragGuardContext = createContext<React.MutableRefObject<boolean> | null>(null)
const DRAG_THRESHOLD = 12 // px before a down->up counts as a drag, not a click

export function DragGuardProvider({ children }: { children: ReactNode }) {
  const didDragRef = useRef(false)
  const downPos = useRef({ x: 0, y: 0 })
  const { gl } = useThree()

  useEffect(() => {
    const dom = gl.domElement

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

    dom.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    return () => {
      dom.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [gl])

  return <DragGuardContext.Provider value={didDragRef}>{children}</DragGuardContext.Provider>
}

export function useDidDrag() {
  const ctx = useContext(DragGuardContext)
  if (!ctx) throw new Error('useDidDrag must be used within DragGuardProvider')
  return ctx
}