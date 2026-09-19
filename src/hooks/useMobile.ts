import { useEffect, useState, useCallback } from 'react'

interface MobileState {
  isTouch: boolean
  isMobile: boolean
  isTablet: boolean
  width: number
  height: number
  orientation: 'portrait' | 'landscape'
}

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export function useMobile(): MobileState {
  const [state, setState] = useState<MobileState>({
    isTouch: false,
    isMobile: false,
    isTablet: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation: 'landscape',
  })

  const updateState = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth
    const height = window.innerHeight
    const isTouch = navigator.maxTouchPoints > 0
    const isMobile = width < MOBILE_BREAKPOINT
    const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
    const orientation = height > width ? 'portrait' : 'landscape'

    setState((prev) => {
      if (
        prev.isTouch === isTouch &&
        prev.isMobile === isMobile &&
        prev.isTablet === isTablet &&
        prev.width === width &&
        prev.height === height &&
        prev.orientation === orientation
      ) {
        return prev
      }
      return { isTouch, isMobile, isTablet, width, height, orientation }
    })
  }, [])

  useEffect(() => {
    updateState()

    window.addEventListener('resize', updateState)
    window.addEventListener('orientationchange', updateState)

    return () => {
      window.removeEventListener('resize', updateState)
      window.removeEventListener('orientationchange', updateState)
    }
  }, [updateState])

  return state
}