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
        <span className="block overflow-hidden">
          <BookCover
            book={book}
            index={index}
            decorative
            className="transition-transform duration-500 group-hover:scale-[1.02] motion-reduce:transition-none"
          />
        </span>
        <span className="mt-4 block text-sm font-semibold text-muted-foreground">
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
