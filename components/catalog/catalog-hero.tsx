import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'
import { CountUp } from './count-up'
import { buttonVariants } from '@/components/ui/button'
import { ageLabel } from '@/lib/books/format'
import { classRank, groupBySeries } from '@/lib/books/hierarchy'
import type { Book } from '@/lib/books/types'
import { cn } from '@/lib/utils'

type Fact = { value: ReactNode; label: string; tone: string }

// Facts come from the published books, so the tiles stay true as the catalogue grows.
function facts(books: Book[]): Fact[] {
  const classes = [...new Set(books.map((b) => b.classLevel.trim()).filter(Boolean))].sort((a, b) => classRank(a) - classRank(b))
  const ages = books.length ? ageLabel(Math.min(...books.map((b) => b.ageMin)), Math.max(...books.map((b) => b.ageMax))) : ''
  const series = groupBySeries(books).length
  const list: (Fact | null)[] = [
    { value: <CountUp to={books.length} />, label: books.length === 1 ? 'book' : 'books', tone: 'bg-[#d61f8a] text-white' },
    { value: <CountUp to={series} />, label: "series", tone: 'bg-band text-white' },
    classes.length
      ? { value: classes.length > 1 ? `${classes[0]} to ${classes[classes.length - 1]}` : classes[0], label: 'classes covered', tone: 'bg-[#fdcc2d] text-foreground' }
      : null,
    ages ? { value: ages.replace('Ages ', ''), label: 'age range', tone: 'bg-[#6cc24a] text-foreground' } : null,
  ]
  return list.filter((f): f is Fact => f !== null)
}

export function CatalogHero({ books }: { books: Book[] }) {
  const tiles = facts(books)
  return (
    <section className="bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
        <div className="anim-rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-field px-4 py-1.5 text-sm font-semibold">
            <span aria-hidden="true" className="size-2 rounded-full bg-[#6cc24a]" />
            Aligned with NEP 2020
          </p>
          <h1 className="max-w-[14ch] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
            Find the right book for every class.
          </h1>
          <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
            Browse by series and subject, or search every title we publish, for reading at home and teaching in the
            classroom.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="#series-heading" className={cn(buttonVariants(), 'h-12 px-7 text-base')}>
              Browse series
            </Link>
            <Link href="#all-books" className={cn(buttonVariants({ variant: 'quiet' }), 'h-12 px-7 text-base')}>
              Search all books
            </Link>
          </div>
        </div>
        {tiles.length > 0 && (
          <ul aria-label="The catalogue at a glance" className="grid grid-cols-2 gap-3 sm:gap-4">
            {tiles.map((t, i) => (
              <li key={t.label} style={{ '--d': `${250 + i * 110}ms` } as CSSProperties} className={cn('anim-pop flex min-h-32 flex-col justify-between rounded-3xl p-5 sm:min-h-40 sm:p-6', t.tone)}>
                <span className="text-2xl leading-tight font-extrabold tracking-[-0.03em] text-balance sm:text-3xl">{t.value}</span>
                <span className="text-sm font-semibold sm:text-base">{t.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
