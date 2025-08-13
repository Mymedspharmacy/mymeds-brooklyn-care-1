import * as React from "react"

// Comprehensive device breakpoints
const BREAKPOINTS = {
  mobile: 480,      // Small mobile devices
  tablet: 768,      // Tablets
  laptop: 1024,     // Small laptops
  desktop: 1440,    // Standard desktops
  wide: 1920        // Wide screens
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.tablet - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.tablet)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.tablet)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDeviceType() {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'laptop' | 'desktop' | 'wide'>('desktop')

  React.useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.mobile) setDeviceType('mobile')
      else if (width < BREAKPOINTS.tablet) setDeviceType('mobile')
      else if (width < BREAKPOINTS.laptop) setDeviceType('tablet')
      else if (width < BREAKPOINTS.desktop) setDeviceType('laptop')
      else if (width < BREAKPOINTS.wide) setDeviceType('desktop')
      else setDeviceType('wide')
    }

    updateDeviceType()
    window.addEventListener('resize', updateDeviceType)
    return () => window.removeEventListener('resize', updateDeviceType)
  }, [])

  return deviceType
}

export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false)

  React.useEffect(() => {
    setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0)
  }, [])

  return isTouch
}

export function useViewportSize() {
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}
