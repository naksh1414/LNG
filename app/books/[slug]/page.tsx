import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { Breadcrumb } from '@/components/catalog/breadcrumb'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { BookCover } from '@/components/book-cover'
import { EnquireButton } from '@/components/enquire-button'
import { ageLabel } from '@/lib/books/format'
import { seriesName } from '@/lib/books/hierarchy'
import { slugify } from '@/lib/books/format'
import { getPublishedBookBySlug as fetchBook } from '@/lib/books/repo'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

// One lookup per request, shared by generateMetadata and the page.
const getPublishedBookBySlug = cache(fetchBook)

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let book
  try {
    book = await getPublishedBookBySlug(slug)
  } catch {
    return { title: 'Books' }
  }
  if (!book) return { title: 'Book not found' }
  return { title: book.title, description: book.subtitle || book.description }
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const book = await getPublishedBookBySlug(slug)
  if (!book) notFound()

  const facts: [string, string | number | null | undefined][] = [
    ['Age', ageLabel(book.ageMin, book.ageMax)],
    ['Series', book.series],
    ['Subject', book.subject],
    ['Class', book.classLevel],
    ['Pages', book.pages],
    ['Language', book.language],
    ['ISBN', book.isbn],
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pt-10 pb-24 md:pt-14 md:pb-32">
        <Breadcrumb
          items={[
            { label: 'Books', href: '/catalog' },
            { label: seriesName(book), href: `/catalog/${slugify(seriesName(book))}` },
            { label: book.subject, href: `/catalog/${slugify(seriesName(book))}/${slugify(book.subject)}` },
            { label: book.title },
          ]}
        />
        <div className="mt-8 grid gap-12 md:mt-12 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-16 lg:gap-24">
          <div className="mx-auto w-[78%] max-w-sm md:sticky md:top-28 md:w-full md:max-w-none md:self-start">
            <div className="rounded-l-spine rounded-r-cover">
              <BookCover book={book} priority />
            </div>
          </div>
          <div>
            <h1 className="text-[2.6rem] leading-[1] font-extrabold tracking-[-0.045em] text-balance sm:text-6xl">
              {book.title}
            </h1>
            {book.subtitle && <p className="mt-5 text-xl leading-snug text-muted-foreground md:text-2xl">{book.subtitle}</p>}
            <p className="mt-6 text-lg">
              by <span className="font-semibold">{book.author}</span>
            </p>
            {book.description && book.description !== book.subtitle && (
              <p className="mt-8 max-w-[60ch] text-lg leading-relaxed">{book.description}</p>
            )}
            <dl className="mt-10 border-t-2 border-foreground">
              {facts.map(([label, value]) =>
                value === undefined || value === null || value === '' ? null : (
                  <div key={label} className="flex items-baseline justify-between gap-6 border-b border-border py-3.5">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-semibold tabular-nums">{value}</dd>
                  </div>
                ),
              )}
            </dl>
            <EnquireButton book={{ id: book.id, title: book.title }} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
