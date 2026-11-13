import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { BookCover } from '@/components/book-cover'
import { buttonVariants } from '@/components/ui/button'
import { ageLabel } from '@/lib/books/format'
import { getPublishedBookBySlug } from '@/lib/books/repo'
import { cn } from '@/lib/utils'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const book = await getPublishedBookBySlug(slug)
  if (!book) return { title: 'Book not found' }
  return { title: book.title, description: book.subtitle || book.description }
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params
  const book = await getPublishedBookBySlug(slug)
  if (!book) notFound()

  const facts: [string, string | number | undefined][] = [
    ['Age', ageLabel(book.ageMin, book.ageMax)],
    ['Subject', book.subject],
    ['Pages', book.pages],
    ['Language', book.language],
    ['ISBN', book.isbn],
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-2 md:gap-16 md:py-16">
        <div className="mx-auto w-full max-w-md md:max-w-none">
          <BookCover book={book} />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-balance md:text-5xl">{book.title}</h1>
          {book.subtitle && <p className="mt-3 text-xl text-muted-foreground">{book.subtitle}</p>}
          <p className="mt-4 font-semibold">{book.author}</p>
          <p className="mt-6 max-w-prose leading-relaxed">{book.description}</p>
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 border-t border-border pt-6 text-sm">
            {facts.map(([label, value]) =>
              value === undefined ? null : (
                <div key={label} className="contents">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ),
            )}
          </dl>
          {/* TASK 5 PLACEHOLDER: replace this link with the enquiry action. */}
          <Link href="/#contact" className={cn(buttonVariants(), 'mt-8')}>
            Enquire about this book
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
