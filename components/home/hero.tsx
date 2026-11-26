import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { BookCover } from '@/components/book-cover'
import { SubjectMark } from '@/components/subject-mark'
import { buttonVariants } from '@/components/ui/button'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'

// Bento of subject tiles; swap a tile's content for a photo when real ones exist.
const tiles = [
  { subject: 'Nature', label: 'Nature', tone: 'bg-[#d61f8a] text-white', mark: 'text-white/90', area: 'col-start-1 row-start-1' },
  { subject: 'Language', label: 'Language', tone: 'bg-band text-white', mark: 'text-white/90', area: 'col-start-1 row-start-2' },
  { subject: 'Science', label: 'Science and culture', tone: 'bg-[#fdcc2d] text-foreground', mark: 'text-foreground', area: 'col-start-2 row-span-2 row-start-1' },
]

const headline = 'Montessori books for homes and classrooms.'

export function Hero({ books = [] }: { books?: Book[] }) {
  const newest = [...books].filter((b) => b.coverUrl).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  return (
    <section className="drift relative bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
      <div className="mx-auto grid min-h-[min(100dvh-6.5rem,40rem)] 2xl:min-h-[min(100dvh-6.5rem,48rem)] max-w-6xl 2xl:max-w-[100rem] items-center gap-12 px-5 py-8 md:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <p className="anim-rise mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-field px-4 py-1.5 text-sm font-semibold">
            <span aria-hidden="true" className="size-2 rounded-full bg-[#6cc24a]" />
            Aligned with NEP 2020
          </p>
          <h1 className="text-[2.5rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl 2xl:text-7xl">
            {headline.split(' ').map((w, i) => (
              <span key={i}>
                <span className="anim-rise inline-block" style={{ '--d': `${120 + i * 70}ms` } as CSSProperties}>
                  {w}
                </span>{' '}
              </span>
            ))}
          </h1>
          <p data-testid="hero-subtext" style={{ '--d': '600ms' } as CSSProperties} className="anim-rise mt-6 max-w-[40ch] text-lg leading-relaxed text-muted-foreground">
            Books that follow how children really learn, written for reading at home and teaching in the classroom.
          </p>
          <div style={{ '--d': '720ms' } as CSSProperties} className="anim-rise mt-9 flex flex-wrap gap-3">
            <Link href="/catalog" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
              Browse books
            </Link>
            <Link href="/#schools" className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 border-accent px-7 text-base text-accent hover:bg-accent/5')}>
              For schools
            </Link>
          </div>
        </div>
        <div className="grid gap-3 sm:gap-4 lg:ml-auto lg:w-full lg:max-w-[28rem] 2xl:max-w-[36rem]">
          <ul aria-hidden="true" className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
            {tiles.map((t, i) => (
              <li key={t.subject} className={cn('anim-pop', t.area)} style={{ '--d': `${350 + i * 130}ms` } as CSSProperties}>
                <div
                  className={cn('bob flex h-full flex-col justify-between rounded-3xl p-5 sm:p-6', t.tone, t.area.includes('row-span-2') ? 'min-h-72' : 'min-h-36 sm:min-h-44')}
                  style={{ '--d': `${-i * 1.7}s` } as CSSProperties}
                >
                  <SubjectMark subject={t.subject} className={cn('size-14 sm:size-20', t.mark)} />
                  <span className="text-base font-bold tracking-[-0.01em] sm:text-lg">{t.label}</span>
                </div>
              </li>
            ))}
          </ul>
          {newest && (
            <Link
              href={`/books/${newest.slug}`}
              style={{ '--d': '750ms' } as CSSProperties}
              className="anim-pop group flex items-center gap-4 rounded-3xl border border-border bg-background/80 p-3 pr-5 transition-colors hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="w-16 shrink-0">
                <BookCover book={newest} decorative className="rounded-xl" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold tracking-wide text-accent uppercase">Newest book</span>
                <span className="block truncate text-lg font-bold tracking-[-0.01em]">{newest.title}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </Link>
          )}
        </div>
      </div>
      {/* Fades the gradient into the page colour so the next section starts smoothly. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </section>
  )
}
