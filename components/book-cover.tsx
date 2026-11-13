import Image from 'next/image'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'

export function BookCover({ book, index = 0, className }: { book: Book; index?: number; className?: string }) {
  const frame = cn('relative block aspect-[3/4] w-full overflow-hidden', className)
  if (book.coverUrl) {
    return (
      <span className={cn(frame, 'bg-muted')}>
        <Image
          src={book.coverUrl}
          alt={book.coverAlt || `Cover of ${book.title}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </span>
    )
  }
  return (
    <span
      aria-hidden="true" // the title and author are repeated as real text next to the cover
      className={cn(
        frame,
        'flex flex-col justify-between p-6',
        index % 2 === 0 ? 'bg-foreground text-background' : 'bg-accent text-accent-foreground',
      )}
    >
      <span className="text-balance text-2xl leading-tight font-bold">{book.title}</span>
      <span className="text-sm font-medium">{book.author}</span>
    </span>
  )
}
