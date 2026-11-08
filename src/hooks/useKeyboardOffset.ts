import { useEffect, useState } from 'react'

// Height (px) of the screen covered by the on-screen keyboard. 0 when disabled or no keyboard.
export function useKeyboardOffset(enabled: boolean) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const vv = window.visualViewport
    if (!enabled || !vv) {
      setOffset(0)
      return
    }
    const update = () =>
      setOffset(Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)))
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update) // iOS pans the visual viewport when the keyboard opens
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [enabled])

  return offset
}