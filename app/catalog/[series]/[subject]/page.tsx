import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BookCard } from '@/components/book-card'
import { Breadcrumb } from '@/components/catalog/breadcrumb'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { groupByClass, groupBySeries } from '@/lib/books/hierarchy'
import { listPublishedBooks } from '@/lib/books/repo'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ series: string; subject: string }> }

async function find(seriesSlug: string, subjectSlug: string) {
  const series = groupBySeries(await listPublishedBooks()).find((s) => s.slug === seriesSlug)
  const subject = series?.subjects.find((s) => s.slug === subjectSlug)
  return series && subject ? { series, subject } : undefined
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series, subject } = await params
  const found = await find(series, subject).catch(() => undefined)
  return { title: found ? `${found.subject.name}, ${found.series.name}` : 'Books' }
}

export default async function SubjectPage({ params }: Props) {
  const { series, subject } = await params
  const found = await find(series, subject)
  if (!found) notFound()
  const classes = groupByClass(found.subject.books)
  let index = 0
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
          <div className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 py-12 md:py-20">
            <Breadcrumb
              items={[
                { label: 'Books', href: '/catalog' },
                { label: found.series.name, href: `/catalog/${found.series.slug}` },
                { label: found.subject.name },
              ]}
            />
            <h1 className="mt-6 max-w-[16ch] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
              {found.subject.name}
            </h1>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
              {found.series.name} books for every class, from {classes[0].level}
              {classes.length > 1 ? ` to ${classes[classes.length - 1].level}` : ''}.
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl 2xl:max-w-[100rem] px-5 pb-16 md:pb-24">
          {classes.map((c) => (
            <section key={c.level} aria-labelledby={`class-${c.level}`.replace(/\s+/g, '-')} className="pt-12 md:pt-16">
              <h2 id={`class-${c.level}`.replace(/\s+/g, '-')} className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                {c.level}
              </h2>
              <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {c.books.map((book) => (
                  <li key={book.id} className="rounded-3xl border border-border bg-field p-3 sm:p-4">
                    <BookCard book={book} index={index++} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
