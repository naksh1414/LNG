import Link from 'next/link'
import { BookCover } from '@/components/book-cover'
import { Reveal } from '@/components/reveal'
import { spreadAcrossSeries } from '@/lib/books/hierarchy'
import type { Book } from '@/lib/books/types'

// Covers are spread across series so no single series fills the picture.
export function PressSection({ books = [] }: { books?: Book[] }) {
  const covers = spreadAcrossSeries(books.filter((b) => b.coverUrl)).slice(0, 4)
  return (
    <section aria-labelledby="press-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <div className="grid items-center gap-8 rounded-[2rem] bg-field p-8 md:p-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <Reveal>
          <h2 id="press-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
            An independent press for curious children.
          </h2>
          <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">
            Learn N Grow makes Montessori books for home and classroom.
          </p>
          <Link
            href="/about"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground/30 px-6 py-3 text-sm font-semibold transition-colors hover:border-foreground hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            More about the press
          </Link>
        </Reveal>
        {covers.length > 0 && (
          <Reveal delay={0.08}>
            <ul aria-hidden="true" className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {covers.map((b, i) => (
                <li key={b.id} className={i % 2 ? 'sm:translate-y-4' : undefined}>
                  <BookCover book={b} index={i} decorative className="rounded-2xl" />
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  )
}
