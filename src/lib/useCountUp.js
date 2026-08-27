import { useEffect, useState } from 'react'

const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    let frame
    const start = performance.now()

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(target * easeOutQuint(progress)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return value
}
