import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { site } from '@/lib/site'
import { makeBook } from './fixtures'
import { FeaturedBooks } from './featured-books'
import { Hero } from './hero'
import { EnquirySection } from './enquiry-section'
import { PressSection } from './press-section'
import { SchoolsSection } from './schools-section'

// jsdom has no IntersectionObserver, which Reveal's whileInView needs.
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  vi.unstubAllGlobals()
  site.whatsappNumber = undefined
})

const renderAll = () =>
  render(
    <>
      <SchoolsSection />
      <PressSection />
      <EnquirySection />
    </>,
  )

describe('home sections', () => {
  it('home sections render with ids schools and contact', () => {
    const { container } = renderAll()
    expect(container.querySelector('section#schools')).not.toBeNull()
    expect(container.querySelector('section#contact')).not.toBeNull()
    expect(screen.getByRole('link', { name: 'Ask about classroom orders' })).toHaveAttribute('href', '/contact')
  })

  it('page contains exactly one contact-intent action label', () => {
    site.whatsappNumber = '+91 98765 43210'
    const books = ['Seed Book', 'Word Book', 'Sky Book'].map((t) => makeBook(t))
    render(
      <>
        <SiteHeader />
        <main>
          <Hero />
          <FeaturedBooks books={books} />
          <SchoolsSection />
          <PressSection />
          <EnquirySection />
        </main>
        <SiteFooter />
      </>,
    )
    const labels = [...screen.queryAllByRole('link'), ...screen.queryAllByRole('button')].map(
      (el) => el.textContent?.trim() ?? '',
    )
    const intent = labels.filter((t) =>
      /get in touch|contact us|let'?s talk|talk to us|reach out|ask (us|about)|speak to|book a call|enquire now/i.test(t),
    )
    expect([...new Set(intent)]).toEqual(['Ask about classroom orders'])
  })

  it('schools action points at the contact entry in site.nav', () => {
    render(<SchoolsSection />)
    const contact = site.nav.find((n) => n.label === 'Contact')!.href
    expect(screen.getByRole('link', { name: 'Ask about classroom orders' })).toHaveAttribute('href', contact)
  })

  it('footer shows the WhatsApp link only when the number is valid', () => {
    site.whatsappNumber = '12345'
    const { unmount } = render(<SiteFooter />)
    expect(screen.queryByRole('link', { name: /whatsapp/i })).toBeNull()
    unmount()

    site.whatsappNumber = '+91 98765 43210'
    render(<SiteFooter />)
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', 'https://wa.me/919876543210')
  })

  it('enquiry section shows the WhatsApp link only when the number is valid', () => {
    site.whatsappNumber = 'not-a-number'
    const { unmount } = render(<EnquirySection />)
    expect(screen.queryByRole('link', { name: /whatsapp/i })).toBeNull()
    unmount()

    site.whatsappNumber = '+91 98765 43210'
    render(<EnquirySection />)
    expect(screen.getByRole('link', { name: /whatsapp/i })).toHaveAttribute('href', 'https://wa.me/919876543210')
  })
})
