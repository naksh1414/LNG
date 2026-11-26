import { AllBooks } from '@/components/home/all-books'
import { AudienceSection } from '@/components/home/audience-section'
import { DigitalSection } from '@/components/home/digital-section'
import { EnquirySection } from '@/components/home/enquiry-section'
import { FeaturedBooks } from '@/components/home/featured-books'
import { Hero } from '@/components/home/hero'
import { LatestBooks } from '@/components/home/latest-books'
import { NepSection } from '@/components/nep-section'
import { PressSection } from '@/components/home/press-section'
import { StatsStrip } from '@/components/home/stats-strip'
import { Testimonials } from '@/components/home/testimonials'
import { SchoolsSection } from '@/components/home/schools-section'
import { SeriesCards } from '@/components/catalog/series-cards'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { groupBySeries, spreadAcrossSeries } from '@/lib/books/hierarchy'
import { listPublishedBooks } from '@/lib/books/repo'
import { listSeriesLogos } from '@/lib/series/repo'
import { listTestimonials } from '@/lib/testimonials/repo'

// Needs a live database, so it renders per request; the build must not require MONGODB_URI.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // A failed testimonials read must not take the home page down.
  const [books, logos, testimonials] = await Promise.all([
    listPublishedBooks(),
    listSeriesLogos(),
    listTestimonials(true).catch(() => []),
  ])
  const featured = spreadAcrossSeries(books.filter((b) => b.featured))
  return (
    <>
      <SiteHeader />
      <main>
        <Hero books={spreadAcrossSeries(books)} />
        <StatsStrip books={books} />
        <SeriesCards series={groupBySeries(books)} logos={logos} />
        <AllBooks books={books} />
        <DigitalSection />
        <AudienceSection />
        <FeaturedBooks books={featured} />
        <NepSection />
        <LatestBooks books={books} />
        <SchoolsSection />
        <PressSection books={books} />
        <Testimonials items={testimonials} />
        <EnquirySection />
      </main>
      <SiteFooter />
    </>
  )
}
