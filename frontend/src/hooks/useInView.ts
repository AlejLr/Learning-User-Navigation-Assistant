import { useEffect, useRef, useState } from 'react'

export function useInView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          obs.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '-40px 0px', ...options }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, inView }
}
