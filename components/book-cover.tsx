import Image from 'next/image'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'

type Props = { book: Book; index?: number; className?: string; priority?: boolean; decorative?: boolean }

// decorative: the title is already text in the surrounding link, so the image gets empty alt.
export function BookCover({ book, index = 0, className, priority, decorative }: Props) {
  const frame = cn('relative block aspect-[3/4] w-full overflow-hidden', className)
  if (book.coverUrl) {
    return (
      <span className={cn(frame, 'bg-muted')}>
        <Image
          src={book.coverUrl}
          alt={decorative ? '' : book.coverAlt || `Cover of ${book.title}`}
          // Next 16 deprecates priority; eager + high fetch priority for the one above-the-fold cover.
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
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
        '@container flex flex-col justify-between p-4 sm:p-6',
        index % 2 === 0 ? 'bg-foreground text-background' : 'bg-accent text-accent-foreground',
      )}
    >
      <span className="text-balance text-lg leading-tight font-bold @[13rem]:text-2xl @[24rem]:text-4xl">{book.title}</span>
      <span className="text-xs font-medium @[13rem]:text-sm @[24rem]:text-base">{book.author}</span>
    </span>
  )
}
