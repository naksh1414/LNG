import Link from 'next/link'
import { BookCard } from '@/components/book-card'
import { Reveal } from '@/components/reveal'
import type { Book } from '@/lib/books/types'
import { ShelfScroller } from './shelf-scroller'

// Needs enough books for a scrolling row to make sense.
export function LatestBooks({ books }: { books: Book[] }) {
  const latest = [...books].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8)
  if (latest.length < 3) return null
  return (
    <section aria-labelledby="latest-heading" className="mx-2 rounded-[2rem] bg-[#f3eefb] sm:mx-4">
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <Reveal>
          <ShelfScroller
            header={
              <div>
                <h2 id="latest-heading" className="text-4xl font-bold tracking-[-0.03em] text-balance md:text-5xl">
                  New on the shelf
                </h2>
                <p className="mt-4 max-w-[44ch] text-lg text-muted-foreground">
                  The newest books from the press.{' '}
                  <Link href="/catalog" className="font-semibold text-foreground underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                    See all books
                  </Link>
                </p>
              </div>
            }
          >
            {latest.map((book, i) => (
              <li key={book.id} className="w-[58%] shrink-0 snap-start sm:w-[34%] md:w-[24%]">
                <BookCard book={book} index={i} />
              </li>
            ))}
          </ShelfScroller>
        </Reveal>
      </div>
    </section>
  )
}
