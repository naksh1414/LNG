import Image from 'next/image'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'
import { SubjectMark } from './subject-mark'

type Props = { book: Book; index?: number; className?: string; priority?: boolean; decorative?: boolean }

// Ground rotates with position so neighbours differ; the mark comes from the subject.
const grounds = [
  { base: 'bg-foreground text-background', mark: 'text-accent' },
  { base: 'bg-accent text-accent-foreground', mark: 'text-background' },
  { base: 'bg-tint text-foreground', mark: 'text-accent' },
]

// Stable per title, so a book keeps its layout wherever it appears.
const variantOf = (slug: string) => [...slug].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 2

// Spine crease and page edge, drawn over both generated and uploaded covers.
const SPINE =
  'linear-gradient(90deg,rgba(0,0,0,0.24) 0,rgba(0,0,0,0.06) 2.5%,rgba(255,255,255,0.14) 3.2%,rgba(255,255,255,0) 7%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.08))'
// behind: sit under the cover type (the parent isolates) so the shading never dims the title.
const spine = (behind = false) => (
  <span
    aria-hidden="true"
    className={cn(behind && '-z-10', 'pointer-events-none absolute inset-0')}
    style={{ backgroundImage: SPINE }}
  />
)

// decorative: the title is already text in the surrounding link, so the image gets empty alt.
export function BookCover({ book, index = 0, className, priority, decorative }: Props) {
  const frame = cn('relative block aspect-[3/4] w-full overflow-hidden rounded-l-spine rounded-r-cover', className)
  if (book.coverUrl) {
    return (
      // Every uploaded cover gets the same 4:5 frame; object-contain fits the whole image inside it, so nothing is cropped.
      <span className={cn(frame, 'aspect-[4/5] overflow-visible bg-background')}>
        <Image
          src={book.coverUrl}
          alt={decorative ? '' : book.coverAlt || `Cover of ${book.title}`}
          // Next 16 deprecates priority; eager + high fetch priority for the one above-the-fold cover.
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : undefined}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          // drop-shadow follows the artwork pixels, not the frame, so the empty bands stay shadowless; needs a `group` ancestor.
          className="object-contain transition-[filter] duration-500 group-hover:drop-shadow-[0_16px_14px_rgba(27,34,54,0.35)] motion-reduce:transition-none"
        />
      </span>
    )
  }
  const ground = grounds[index % grounds.length]
  const title = (
    <span className="text-balance text-lg leading-[1.08] font-extrabold tracking-[-0.025em] @[13rem]:text-[1.65rem] @[24rem]:text-[2.6rem]">
      {book.title}
    </span>
  )
  const author = (
    <span className="block border-t border-current/25 pt-2 text-[0.7rem] font-semibold tracking-[0.01em] @[13rem]:pt-3 @[13rem]:text-sm @[24rem]:text-base">
      {book.author}
    </span>
  )
  return (
    <span
      aria-hidden="true" // the title and author are repeated as real text next to the cover
      className={cn(frame, '@container isolate flex flex-col py-4 pr-4 pl-5 sm:py-6 sm:pr-6 sm:pl-7', ground.base)}
    >
      {variantOf(book.slug) === 0 ? (
        <>
          {title}
          <SubjectMark subject={book.subject} className={cn('mt-auto mb-4 w-[38%] self-end @[13rem]:mb-6', ground.mark)} />
          {author}
        </>
      ) : (
        <>
          <SubjectMark subject={book.subject} className={cn('w-[22%]', ground.mark)} />
          <span className="mt-auto mb-3 @[13rem]:mb-5">{title}</span>
          {author}
        </>
      )}
      {spine(true)}
    </span>
  )
}
