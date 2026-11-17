'use client'

import { Search } from 'lucide-react'
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
      <div className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter by subject" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {[ALL, ...subjects].map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={subject === s}
                onClick={() => setSubject(s)}
                className={cn(
                  'h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  subject === s
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-input bg-field text-foreground hover:border-foreground',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search books"
              placeholder="Find a book"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                trackSearch(e.target.value)
              }}
              className="h-10 rounded-full pl-10"
            />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-12 md:pb-16">
        <p aria-live="polite" className="text-sm font-medium text-muted-foreground">
          {shown.length} {shown.length === 1 ? 'title' : 'titles'}
        </p>
        {shown.length ? (
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {shown.map(({ book, index }) => (
              <motion.li
                key={book.id}
                layout={!reduce}
                initial={false}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-border bg-field p-3 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(27,34,54,0.45)] sm:p-4"
              >
                <BookCard book={book} index={index} />
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-3xl border border-border bg-field px-6 py-16 text-center md:py-24">
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
      </div>
    </section>
  )
}
