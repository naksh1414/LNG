'use client'

import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

// Server HTML and reduced motion show the real number; otherwise it counts up once when it scrolls into view.
export function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [n, setN] = useState(to)
  useEffect(() => {
    if (!inView || reduce) return setN(to)
    const controls = animate(0, to, { duration: 1.2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(Math.round(v)) })
    return () => controls.stop()
  }, [inView, reduce, to])
  return <span ref={ref}>{n}</span>
}
