import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { BookCover } from '@/components/book-cover'
import { Reveal } from '@/components/reveal'
import { ageLabel } from '@/lib/books/format'
import type { SeriesGroup } from '@/lib/books/hierarchy'

export function SeriesCards({ series }: { series: SeriesGroup[] }) {
  if (series.length === 0) return null
  return (
    <section aria-labelledby="series-heading" className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <Reveal>
        <h2 id="series-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
          Start with a series
        </h2>
        <p className="mt-4 max-w-[48ch] text-lg text-muted-foreground">
          Each series has its subjects, and each subject has a book for every class.
        </p>
      </Reveal>
      <ul className="mt-10 grid gap-4 md:grid-cols-2 md:gap-5">
        {series.map((s) => {
          const covers = s.books.slice(0, 3)
          return (
            <li key={s.slug}>
              <Link
                href={`/catalog/${s.slug}`}
                className="group flex h-full flex-col gap-6 rounded-3xl border border-border bg-field p-6 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(27,34,54,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:flex-row sm:items-center"
              >
                <span aria-hidden="true" className="flex shrink-0 -space-x-8">
                  {covers.map((b, i) => (
                    <span key={b.id} className="w-24 rounded-2xl shadow-[0_14px_24px_-14px_rgba(27,34,54,0.6)] sm:w-28" style={{ zIndex: 3 - i }}>
                      <BookCover book={b} index={i} className="rounded-2xl" decorative />
                    </span>
                  ))}
                </span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-4 text-2xl font-bold tracking-[-0.02em] group-hover:text-accent">
                    {s.name}
                    <ArrowUpRight aria-hidden="true" className="size-6 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none" />
                  </span>
                  <span className="mt-2 block text-muted-foreground">
                    {s.subjects.length} {s.subjects.length === 1 ? 'subject' : 'subjects'}, {s.books.length}{' '}
                    {s.books.length === 1 ? 'book' : 'books'}, {ageLabel(s.ageMin, s.ageMax).toLowerCase()}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
