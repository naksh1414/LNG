import { FeaturedBooks } from '@/components/home/featured-books'
import { Hero } from '@/components/home/hero'
import { SubjectsRow } from '@/components/home/subjects-row'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { listPublishedBooks, listSubjects } from '@/lib/books/repo'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [books, subjects] = await Promise.all([listPublishedBooks(), listSubjects()])
  const featured = books.filter((b) => b.featured)
  return (
    <>
      <SiteHeader />
      <main>
        <Hero books={featured.slice(0, 3)} />
        <SubjectsRow subjects={subjects} />
        <FeaturedBooks books={featured} />
      </main>
      <SiteFooter />
    </>
  )
}
