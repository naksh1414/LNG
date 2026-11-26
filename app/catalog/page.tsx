import { CatalogHero } from '@/components/catalog/catalog-hero'
import { SeriesCards } from '@/components/catalog/series-cards'
import { listSeriesLogos } from '@/lib/series/repo'
import { groupBySeries } from '@/lib/books/hierarchy'
import { CatalogExtras } from '@/components/catalog/catalog-extras'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { catalogHref, PAGE_SIZE, parseCatalogQuery } from '@/lib/books/catalog-query'
import { listPublishedBooks, listSubjects, searchPublishedBooks } from '@/lib/books/repo'
import { redirect } from 'next/navigation'
import { CatalogClient } from './catalog-client'

export const metadata = {
  title: 'Catalogue',
  description: 'Browse the Learn N Grow library of thoughtful books for curious children.',
}

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function CatalogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  // The hero numbers and series cards summarise the whole catalogue; they render on the server and only
  // their small output reaches the browser. The grid below gets one page.
  const [all, subjects, logos] = await Promise.all([listPublishedBooks(), listSubjects(), listSeriesLogos()])
  const query = parseCatalogQuery(params, subjects)
  const { books, total } = await searchPublishedBooks({ ...query, pageSize: PAGE_SIZE })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  // A page number past the end (an old link, or a search that now has fewer results) goes to the last page.
  if (query.page > totalPages) redirect(`${catalogHref({ ...query, page: totalPages })}#all-books`)
  return (
    <>
      <SiteHeader />
      <main>
        <CatalogHero books={all} />
        <SeriesCards series={groupBySeries(all)} logos={logos} />
        <CatalogClient
          books={books}
          subjects={subjects}
          subject={query.subject}
          q={query.q}
          page={query.page}
          totalPages={totalPages}
          total={total}
          catalogTotal={all.length}
        />
        <CatalogExtras />
      </main>
      <SiteFooter />
    </>
  )
}
