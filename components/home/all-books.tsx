import Link from 'next/link'
import { BookCard } from '@/components/book-card'
import { Reveal } from '@/components/reveal'
import type { Book } from '@/lib/books/types'

// Dense grid so a wide screen fills with covers; capped so the home page stays short.
export function AllBooks({ books }: { books: Book[] }) {
  const shown = books.slice(0, 12)
  if (shown.length < 3) return null
  return (
    <section aria-labelledby="all-books-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="all-books-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
              Browse the books
            </h2>
            <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">Titles from every series, all in one place.</p>
          </div>
          <Link href="/catalog" className="font-semibold underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            See all {books.length} books
          </Link>
        </div>
      </Reveal>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6">
        {shown.map((b, i) => (
          <li key={b.id}>
            <BookCard book={b} index={i} />
          </li>
        ))}
      </ul>
    </section>
  )
}
