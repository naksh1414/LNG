import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { site } from '@/lib/site'
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
    expect(screen.getByRole('link', { name: 'Ask about classroom orders' })).toHaveAttribute('href', '/#contact')
  })

  it('page contains exactly one contact-intent action label', () => {
    renderAll()
    const labels = [...screen.queryAllByRole('link'), ...screen.queryAllByRole('button')].map(
      (el) => el.textContent?.trim() ?? '',
    )
    const intent = labels.filter((t) => /get in touch|contact us|let's talk/i.test(t))
    expect(new Set(intent).size).toBeLessThanOrEqual(1)
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
