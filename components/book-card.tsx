import Link from 'next/link'
import { ageLabel } from '@/lib/books/format'
import type { Book } from '@/lib/books/types'
import { BookCover } from './book-cover'

export function BookCard({ book, index }: { book: Book; index: number }) {
  return (
    <article>
      <Link
        href={`/books/${book.slug}`}
        className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <span className="block shadow-[0_18px_30px_-22px_rgba(35,44,54,0.6)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1.5 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0">
          <BookCover book={book} index={index} decorative />
        </span>
        <span className="mt-5 block text-[0.8125rem] font-semibold text-muted-foreground tabular-nums">
          {book.subject}, {ageLabel(book.ageMin, book.ageMax).toLowerCase()}
        </span>
        <span className="mt-1.5 block text-lg leading-snug font-bold tracking-[-0.01em] text-foreground transition-colors group-hover:text-accent">
          {book.title}
        </span>
        {book.subtitle && <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{book.subtitle}</span>}
      </Link>
    </article>
  )
}
