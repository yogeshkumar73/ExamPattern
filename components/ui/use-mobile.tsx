'use client'

import * as React from 'react'

/**
 * Responsive Breakpoints
 * xs : < 640px
 * sm : 640px
 * md : 768px
 * lg : 1024px
 * xl : 1280px
 * 2xl: 1536px
 */

export const BREAKPOINTS = {
  xs: 640,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type ScreenSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'

export function useScreen() {
  const [width, setWidth] = React.useState(0)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const update = () => setWidth(window.innerWidth)

    update()

    window.addEventListener('resize', update)

    return () => window.removeEventListener('resize', update)
  }, [])

  return {
    width,
    isMobile: width < BREAKPOINTS.md,
    isTablet:
      width >= BREAKPOINTS.md &&
      width < BREAKPOINTS.lg,
    isLaptop:
      width >= BREAKPOINTS.lg &&
      width < BREAKPOINTS.xl,
    isDesktop:
      width >= BREAKPOINTS.xl &&
      width < BREAKPOINTS['2xl'],
    isLargeDesktop:
      width >= BREAKPOINTS['2xl'],
  }
}

export function useIsMobile() {
  return useScreen().isMobile
}