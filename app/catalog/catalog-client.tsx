'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { BookCard } from '@/components/book-card'
import { trackSearch } from '@/components/analytics-tracker'
import { Pagination } from '@/components/catalog/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { catalogHref, PAGE_SIZE } from '@/lib/books/catalog-query'
import type { Book } from '@/lib/books/types'
import { useDebouncedValue } from '@/lib/timing'
import { cn } from '@/lib/utils'

const ALL = 'All series'
const ALL_SUBJECTS = 'All subjects'
const chip = 'h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent inline-flex items-center'

// The server sends one page of books. Filters, search and paging are links and URL changes, not browser state.
export function CatalogClient({
  books,
  series,
  activeSeries,
  subject,
  q,
  page,
  totalPages,
  total,
  catalogTotal,
}: {
  books: Book[]
  series: { name: string; slug: string; subjects: string[] }[]
  activeSeries?: string
  subject?: string
  q: string
  page: number
  totalPages: number
  total: number
  catalogTotal: number
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [value, setValue] = useState(q)
  const debounced = useDebouncedValue(value, 350)
  // The last search this component put in the URL; a different q means the URL changed elsewhere (a link).
  const pushed = useRef(q)

  useEffect(() => {
    if (debounced.trim() === pushed.current) return
    pushed.current = debounced.trim()
    startTransition(() => router.replace(catalogHref({ series: activeSeries, subject, q: pushed.current }), { scroll: false }))
  }, [debounced, activeSeries, subject, router])

  useEffect(() => {
    if (q !== pushed.current) {
      pushed.current = q
      setValue(q)
    }
  }, [q])

  const current = series.find((x) => x.slug === activeSeries)
  const first = (page - 1) * PAGE_SIZE + 1
  const clear = catalogHref({})

  return (
    <section id="all-books" aria-label="Browse our books" className="scroll-mt-[4.4rem]">
      <div className="sticky top-[4.4rem] z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl 2xl:max-w-[100rem] flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label="Filter by series" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {[{ name: ALL, slug: undefined }, ...series].map((s) => {
              const active = s.slug === activeSeries
              return (
                <Link
                  key={s.name}
                  href={catalogHref({ series: s.slug, q })}
                  scroll={false}
                  aria-current={active ? 'true' : undefined}
                  className={cn(chip, active ? 'border-foreground bg-foreground text-background' : 'border-input bg-field text-foreground hover:border-foreground')}
                >
                  {s.name}
                </Link>
              )
            })}
          </div>
          <div className="relative md:w-72">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              aria-label="Search books"
              placeholder="Find a book"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                trackSearch(e.target.value)
              }}
              className="h-10 rounded-full pl-10"
            />
          </div>
        </div>
        {(current || subject) && (
          <div className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-4">
            <div role="group" aria-label={current ? `Subjects in ${current.name}` : 'Subject filter'} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
              {current ? (
                [{ name: ALL_SUBJECTS, value: undefined }, ...current.subjects.map((n) => ({ name: n, value: n }))].map((s) => {
                  const active = s.value === subject
                  return (
                    <Link
                      key={s.name}
                      href={catalogHref({ series: activeSeries, subject: s.value, q })}
                      scroll={false}
                      aria-current={active ? 'true' : undefined}
                      className={cn(chip, 'h-9 px-4', active ? 'border-accent bg-accent text-accent-foreground' : 'border-input bg-background text-foreground hover:border-foreground')}
                    >
                      {s.name}
                    </Link>
                  )
                })
              ) : (
                // An old ?subject= link with no series: show it as a removable filter.
                <Link href={catalogHref({ q })} scroll={false} className={cn(chip, 'h-9 border-accent bg-accent px-4 text-accent-foreground')}>
                  Subject: {subject} ✕
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pt-8 pb-12 md:pb-16" aria-busy={pending}>
        <p aria-live="polite" className="text-sm font-medium text-muted-foreground">
          {total === 0 ? '0 titles' : `Showing ${first} to ${first + books.length - 1} of ${total} ${total === 1 ? 'title' : 'titles'}`}
        </p>
        {books.length ? (
          <ul className={cn('mt-5 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 transition-opacity', pending && 'opacity-60')}>
            {books.map((book, i) => (
              <li
                key={book.id}
                className="rounded-3xl border border-border bg-field p-3 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(27,34,54,0.45)] sm:p-4"
              >
                <BookCard book={book} index={(page - 1) * PAGE_SIZE + i} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-3xl border border-border bg-field px-6 py-16 text-center md:py-24">
            {catalogTotal === 0 ? (
              <>
                <h2 className="text-3xl font-bold tracking-[-0.03em]">No books yet</h2>
                <p className="mt-3 text-lg text-muted-foreground">New titles are on the way. Please check back soon.</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold tracking-[-0.03em]">No books found</h2>
                <p className="mt-3 text-lg text-muted-foreground">Try another title, author or subject.</p>
                <Link href={clear} scroll={false} className="mt-6 inline-block">
                  <Button type="button" variant="quiet" tabIndex={-1}>
                    Clear filters
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} hrefFor={(n) => `${catalogHref({ series: activeSeries, subject, q, page: n })}#all-books`} />
      </div>
    </section>
  )
}
