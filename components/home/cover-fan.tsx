'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import { BookCover } from '@/components/book-cover'
import type { Book } from '@/lib/books/types'

// Slot 0 is the front cover in the middle; 1 and 2 are the wings behind it.
const slots = [
  { left: '27%', top: '6%', z: 3, rest: { x: 0, y: 0, rotate: -2 }, hover: { x: 0, y: -14, rotate: 0 } },
  { left: '0%', top: '16%', z: 1, rest: { x: 0, y: 0, rotate: -11 }, hover: { x: -28, y: 6, rotate: -15 } },
  { left: '54%', top: '13%', z: 2, rest: { x: 0, y: 0, rotate: 9 }, hover: { x: 28, y: 4, rotate: 13 } },
]
// Cover colour alternates on index parity: slate front, terracotta wings.
const colourIndex = [0, 1, 3]
const spring = { type: 'spring', stiffness: 140, damping: 18 } as const

export function CoverFan({ books }: { books: Book[] }) {
  const reduce = useReducedMotion()
  const shown = books.slice(0, 3)
  if (shown.length === 0) return null
  return (
    <motion.div
      data-testid="cover-fan"
      className="relative mx-auto aspect-[5/4] w-[88%] max-w-[34rem] sm:w-full"
      initial={false}
      animate="rest"
      whileHover={reduce ? undefined : 'hover'}
    >
      {shown.map((book, i) => {
        const slot = slots[i]
        const variants: Variants = {
          rest: { ...slot.rest, transition: spring },
          hover: { ...slot.hover, transition: spring },
        }
        return (
          <motion.div
            key={book.id}
            variants={variants}
            className="fan-in absolute w-[46%] shadow-[0_30px_60px_-28px_rgba(35,44,54,0.55)]"
            style={{ left: slot.left, top: slot.top, zIndex: slot.z, animationDelay: `${150 + i * 80}ms` }}
          >
            <BookCover book={book} index={colourIndex[i]} priority={i === 0} decorative />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
