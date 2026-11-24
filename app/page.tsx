import { AudienceSection } from '@/components/home/audience-section'
import { EnquirySection } from '@/components/home/enquiry-section'
import { FeaturedBooks } from '@/components/home/featured-books'
import { Hero } from '@/components/home/hero'
import { LatestBooks } from '@/components/home/latest-books'
import { NepSection } from '@/components/nep-section'
import { PressSection } from '@/components/home/press-section'
import { SchoolsSection } from '@/components/home/schools-section'
import { SubjectsRow } from '@/components/home/subjects-row'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { spreadAcrossSeries } from '@/lib/books/hierarchy'
import { listPublishedBooks, listSubjects } from '@/lib/books/repo'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [books, subjects] = await Promise.all([listPublishedBooks(), listSubjects()])
  const featured = spreadAcrossSeries(books.filter((b) => b.featured))
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <AudienceSection />
        <FeaturedBooks books={featured} />
        <SubjectsRow subjects={subjects} />
        <NepSection />
        <LatestBooks books={books} />
        <SchoolsSection />
        <PressSection />
        <EnquirySection />
      </main>
      <SiteFooter />
    </>
  )
}
