import { CatalogHero } from '@/components/catalog/catalog-hero'
import { SeriesCards } from '@/components/catalog/series-cards'
import { listSeriesLogos } from '@/lib/series/repo'
import { groupBySeries } from '@/lib/books/hierarchy'
import { CatalogExtras } from '@/components/catalog/catalog-extras'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { listPublishedBooks, listSubjects } from '@/lib/books/repo'
import { CatalogClient } from './catalog-client'

export const metadata = {
  title: 'Catalogue',
  description: 'Browse the Learn N Grow library of thoughtful books for curious children.',
}

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ subject?: string | string[] }> }) {
  const { subject } = await searchParams
  const initial = typeof subject === 'string' ? subject : undefined
  const [books, subjects, logos] = await Promise.all([listPublishedBooks(), listSubjects(), listSeriesLogos()])
  return (
    <>
      <SiteHeader />
      <main>
        <CatalogHero books={books} />
        <SeriesCards series={groupBySeries(books)} logos={logos} />
        {/* key resets the chip when only the query string changes */}
        <CatalogClient key={initial} books={books} subjects={subjects} initialSubject={initial} />
        <CatalogExtras />
      </main>
      <SiteFooter />
    </>
  )
}
