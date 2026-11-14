'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { BookCard } from '@/components/book-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trackSearch } from '@/components/analytics-tracker'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'

const ALL = 'All books'

export function CatalogClient({
  books,
  subjects,
  initialSubject,
}: {
  books: Book[]
  subjects: string[]
  initialSubject?: string
}) {
  const reduce = useReducedMotion()
  const [subject, setSubject] = useState(initialSubject && subjects.includes(initialSubject) ? initialSubject : ALL)
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const shown = books
    .map((book, index) => ({ book, index }))
    .filter(
    ({ book: b }) =>
      (subject === ALL || b.subject === subject) &&
      (!q || `${b.title} ${b.author} ${b.subject}`.toLowerCase().includes(q)),
    )
  const clear = () => {
    setSubject(ALL)
    setQuery('')
  }

  return (
    <section aria-label="Browse our books">
      <div className="flex flex-col gap-5 border-t-2 border-foreground pt-6 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by subject" className="flex flex-wrap gap-2">
          {[ALL, ...subjects].map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={subject === s}
              onClick={() => setSubject(s)}
              className={cn(
                'h-10 border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                subject === s
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-input text-foreground hover:border-foreground hover:bg-foreground/5',
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <Input
          type="search"
          aria-label="Search books"
          placeholder="Find a book"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            trackSearch(e.target.value)
          }}
          className="md:max-w-[17rem]"
        />
      </div>
      <p aria-live="polite" className="mt-8 text-sm text-muted-foreground">
        {shown.length} {shown.length === 1 ? 'title' : 'titles'}
      </p>
      {shown.length ? (
        <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-16">
          {shown.map(({ book, index }) => (
            <motion.li
              key={book.id}
              layout={!reduce}
              initial={false}
              transition={{ duration: 0.25 }}
            >
              <BookCard book={book} index={index} />
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 border-t border-border py-16 md:py-24">
          {books.length === 0 ? (
            <>
              <h2 className="text-3xl font-bold tracking-[-0.03em]">No books yet</h2>
              <p className="mt-3 text-lg text-muted-foreground">New titles are on the way. Please check back soon.</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold tracking-[-0.03em]">No books found</h2>
              <p className="mt-3 text-lg text-muted-foreground">Try another title, author or subject.</p>
              <Button type="button" variant="quiet" className="mt-6" onClick={clear}>
                Clear filters
              </Button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
