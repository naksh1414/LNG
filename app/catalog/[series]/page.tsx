import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Breadcrumb } from '@/components/catalog/breadcrumb'
import { CatalogExtras } from '@/components/catalog/catalog-extras'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SubjectMark } from '@/components/subject-mark'
import { ageLabel } from '@/lib/books/format'
import { groupByClass, groupBySeries } from '@/lib/books/hierarchy'
import { listPublishedBooks } from '@/lib/books/repo'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ series: string }> }

async function find(slug: string) {
  return groupBySeries(await listPublishedBooks()).find((s) => s.slug === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { series } = await params
  const group = await find(series).catch(() => undefined)
  return { title: group?.name ?? 'Books' }
}

export default async function SeriesPage({ params }: Props) {
  const { series } = await params
  const group = await find(series)
  if (!group) notFound()
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
          <div className="mx-auto max-w-6xl px-5 py-12 md:py-20">
            <Breadcrumb items={[{ label: 'Books', href: '/catalog' }, { label: group.name }]} />
            <h1 className="mt-6 max-w-[16ch] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
              {group.name}
            </h1>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted-foreground md:text-xl">
              {group.subjects.length} {group.subjects.length === 1 ? 'subject' : 'subjects'}, {group.books.length}{' '}
              {group.books.length === 1 ? 'book' : 'books'}, {ageLabel(group.ageMin, group.ageMax).toLowerCase()}. Pick a
              subject to see the book for each class.
            </p>
          </div>
        </section>
        <section aria-labelledby="subjects-heading" className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <h2 id="subjects-heading" className="text-3xl font-bold tracking-[-0.03em] md:text-4xl">
            Subjects in {group.name}
          </h2>
          <ul className="mt-8 grid gap-4 md:grid-cols-2 md:gap-5">
            {group.subjects.map((s) => {
              const classes = groupByClass(s.books).map((c) => c.level)
              return (
                <li key={s.slug}>
                  <Link
                    href={`/catalog/${group.slug}/${s.slug}`}
                    className="group flex h-full items-center gap-5 rounded-3xl border border-border bg-field p-6 transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(27,34,54,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    <span aria-hidden="true" className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#fbe3ee] text-[#d61f8a]">
                      <SubjectMark subject={s.name} className="size-9" />
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center justify-between gap-4 text-xl font-bold tracking-[-0.01em] group-hover:text-accent">
                        {s.name}
                        <ArrowUpRight aria-hidden="true" className="size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transition-none" />
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        {s.books.length} {s.books.length === 1 ? 'book' : 'books'}:{' '}
                        {classes.length > 1 ? `${classes[0]} to ${classes[classes.length - 1]}` : classes[0]}
                      </span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
        <CatalogExtras />
      </main>
      <SiteFooter />
    </>
  )
}
