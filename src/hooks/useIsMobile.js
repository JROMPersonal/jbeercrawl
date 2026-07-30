import { useEffect, useState } from 'react'

// Matches the `max-width: 760px` breakpoint used throughout App.css.
const QUERY = '(max-width: 760px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const handleChange = (event) => setIsMobile(event.matches)
    mql.addEventListener('change', handleChange)
    return () => mql.removeEventListener('change', handleChange)
  }, [])

  return isMobile
}
