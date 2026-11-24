'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { useRef } from 'react'

const arrow =
  'inline-flex size-11 items-center justify-center rounded-full border border-foreground/20 bg-background text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

// Native scroll-snap row with arrow buttons; the buttons are extra, so keyboard and touch scrolling still work.
export function ShelfScroller({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const row = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const go = (dir: 1 | -1) =>
    row.current?.scrollBy({ left: dir * row.current.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' })
  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        {header}
        <div className="flex gap-2">
          <button type="button" aria-label="Scroll books left" onClick={() => go(-1)} className={arrow}>
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button type="button" aria-label="Scroll books right" onClick={() => go(1)} className={arrow}>
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
      <ul
        ref={row}
        className="-mx-5 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-5 px-5 pb-4 [scrollbar-width:none] md:mx-0 md:px-0 md:scroll-px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>
    </>
  )
}
