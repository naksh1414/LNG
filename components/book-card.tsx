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
        <BookCover book={book} index={index} decorative />
        <span className="mt-4 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {book.subject} &middot; {ageLabel(book.ageMin, book.ageMax)}
        </span>
        <span className="mt-1 block text-lg font-bold text-foreground group-hover:text-accent">{book.title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{book.subtitle}</span>
      </Link>
    </article>
  )
}
