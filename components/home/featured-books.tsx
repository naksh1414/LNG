import Link from 'next/link'
import { BookCard } from '@/components/book-card'
import { BookCover } from '@/components/book-cover'
import { Reveal } from '@/components/reveal'
import { ageLabel } from '@/lib/books/format'
import type { Book } from '@/lib/books/types'

export function FeaturedBooks({ books }: { books: Book[] }) {
  if (books.length === 0) return null
  const [lead, ...rest] = books.slice(0, 4)
  return (
    <section aria-labelledby="featured-heading" className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <Reveal>
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7 lg:col-start-6 lg:row-start-1">
            <h2 id="featured-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
              Our current favourites
            </h2>
            <p className="mt-5 max-w-[42ch] text-lg text-muted-foreground">
              Chosen by our editors for reading together, at home or in the classroom.
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-block text-sm font-semibold underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              See all books
            </Link>
          </div>
          <article className="lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <Link
              href={`/books/${lead.slug}`}
              className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="block w-[82%] rounded-l-spine rounded-r-cover shadow-[0_30px_50px_-30px_rgba(27,34,54,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-2 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 sm:w-[70%] lg:w-full">
                <BookCover book={lead} index={0} decorative />
              </span>
              <span className="mt-6 block text-sm font-semibold text-muted-foreground">
                {lead.subject}, {ageLabel(lead.ageMin, lead.ageMax).toLowerCase()}
              </span>
              <span className="mt-2 block text-3xl font-bold tracking-[-0.02em] group-hover:text-accent md:text-4xl">
                {lead.title}
              </span>
              <span className="mt-3 block max-w-[46ch] text-lg text-muted-foreground">{lead.description}</span>
            </Link>
          </article>
          {rest.length > 0 && (
            <ul className="grid grid-cols-2 gap-x-5 gap-y-12 self-end sm:grid-cols-3 sm:gap-x-6 lg:col-span-7 lg:col-start-6 lg:row-start-2">
              {rest.map((book, i) => (
                // Two columns on phones: the third pick would sit alone, so it waits for the wider grid.
                <li key={book.id} className={i === 2 ? 'max-sm:hidden' : undefined}>
                  <BookCard book={book} index={i + 1} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </section>
  )
}
