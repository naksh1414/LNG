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
    <section aria-labelledby="latest-heading" className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-8 md:py-12">
      <div className="rounded-[2rem] bg-[#f3eefb] p-8 md:p-12">
        <Reveal>
          <ShelfScroller
            header={
              <div>
                <h2 id="latest-heading" className="text-3xl font-bold tracking-[-0.03em] text-balance md:text-4xl">
                  New on the shelf
                </h2>
                <p className="mt-3 max-w-[48ch] text-base text-foreground/75 md:text-lg">
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
