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

export default async function CatalogPage() {
  const [books, subjects] = await Promise.all([listPublishedBooks(), listSubjects()])
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <h1 className="mb-10 max-w-2xl text-4xl font-bold text-balance md:text-5xl">Books for a life of discovery.</h1>
        <CatalogClient books={books} subjects={subjects} />
      </main>
      <SiteFooter />
    </>
  )
}
