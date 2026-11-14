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
      <main className="mx-auto max-w-6xl px-5 pt-16 pb-24 md:pt-24 md:pb-32">
        <h1 className="max-w-[14ch] text-[2.6rem] leading-[1] font-extrabold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
          Books for a life of discovery.
        </h1>
        <p className="mt-6 mb-14 max-w-[44ch] text-lg leading-relaxed text-pretty text-muted-foreground md:mb-20 md:text-xl">
          Every title we publish, for reading at home and teaching in the classroom.
        </p>
        {/* key resets the chip when only the query string changes */}
        <CatalogClient key={initial} books={books} subjects={subjects} initialSubject={initial} />
      </main>
      <SiteFooter />
    </>
  )
}
