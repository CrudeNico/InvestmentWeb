import { useEffect, useRef } from 'react'

const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const element = elementRef.current
      
      if (element) {
        const yPos = -(scrolled * speed)
        element.style.transform = `translateY(${yPos}px)`
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return elementRef
}

export default useParallax
