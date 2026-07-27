// components/IntroCameraControls.tsx
import { useControls, folder } from 'leva'

export function useIntroCameraDebug() {
  const values = useControls('Intro Camera', {
    start: folder({
      startX: { value: -2.2, step: 0.1 },
      startY: { value: 3.2, step: 0.1 },
      startZ: { value: 9.2, step: 0.1 },
    }),
    end: folder({
      endX: { value: 0, step: 0.1 },
      endY: { value: 0.1, step: 0.1 },
      endZ: { value: 1.9, step: 0.1 },
    }),
    duration: { value: 5, min: 0.5, max: 10, step: 0.5 },
  })

  return {
    start: [values.startX, values.startY, values.startZ] as [number, number, number],
    end: [values.endX, values.endY, values.endZ] as [number, number, number],
    duration: values.duration,
  }
}