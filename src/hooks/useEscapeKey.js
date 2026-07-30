import { useEffect, useRef } from 'react'

// Shared across all instances so that when modals are stacked (e.g. the Add
// JBeer Crawl form opened on top of the crawl detail popup), Escape closes
// only the topmost one instead of all of them at once.
const stack = []

/**
 * Closes the calling modal when Escape is pressed, as long as it's the
 * topmost modal currently open.
 * @param {() => void} onClose
 */
export function useEscapeKey(onClose) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const entry = () => onCloseRef.current()
    stack.push(entry)

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (stack[stack.length - 1] === entry) entry()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      const index = stack.indexOf(entry)
      if (index !== -1) stack.splice(index, 1)
    }
  }, [])
}
