import { SeriesCards } from '@/components/catalog/series-cards'
import { groupBySeries } from '@/lib/books/hierarchy'
import { CatalogExtras } from '@/components/catalog/catalog-extras'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { listPublishedBooks, listSubjects } from '@/lib/books/repo'
import { CatalogClient } from './catalog-client'

export const metadata = {
  title: 'Books',
  description: 'Browse the Learn and Grow library of thoughtful books for curious children.',
}

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ subject?: string | string[] }> }) {
  const { subject } = await searchParams
  const initial = typeof subject === 'string' ? subject : undefined
  const [books, subjects] = await Promise.all([listPublishedBooks(), listSubjects()])
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[linear-gradient(115deg,#fbfaf7_35%,#f3eefb_70%,#dfeafb_100%)]">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-20">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-field px-4 py-1.5 text-sm font-semibold">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#6cc24a]" />
              Aligned with NEP 2020
            </p>
            <h1 className="max-w-[16ch] text-[2.4rem] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
              Books for a life of discovery.
            </h1>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
              Every title we publish, for reading at home and teaching in the classroom.
            </p>
          </div>
        </section>
        <SeriesCards series={groupBySeries(books)} />
        {/* key resets the chip when only the query string changes */}
        <CatalogClient key={initial} books={books} subjects={subjects} initialSubject={initial} />
        <CatalogExtras />
      </main>
      <SiteFooter />
    </>
  )
}
