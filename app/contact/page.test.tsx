import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { site } from '@/lib/site'
import ContactPage from './page'

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
  vi.unstubAllEnvs()
  site.whatsappNumber = undefined
})

describe('contact page', () => {
  it('contact page renders the form and omits unconfigured details', () => {
    const sample = { ...site.contact }
    Object.assign(site.contact, { phone: '', address: '', directionsUrl: '' })
    vi.stubEnv('NEXT_PUBLIC_CONTACT_EMAIL', '')
    site.whatsappNumber = 'not-a-number'
    const { container, unmount } = render(<ContactPage />)
    expect(container.querySelector('form')).not.toBeNull()
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
    expect(container.querySelector('a[href*="wa.me"]')).toBeNull()
    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    // The form's own "Phone or email" label is expected; the details column must not show placeholders.
    const outsideForm = container.textContent!.replace(container.querySelector('form')!.textContent!, '')
    expect(outsideForm).not.toMatch(/phone|address|example\.com/i)
    expect(outsideForm).not.toMatch(/directions/i)
    unmount()

    Object.assign(site.contact, sample)
    vi.stubEnv('NEXT_PUBLIC_CONTACT_EMAIL', 'hello@learnandgrow.in')
    site.whatsappNumber = '+91 98765 43210'
    render(<ContactPage />)
    expect(screen.getByRole('link', { name: 'hello@learnandgrow.in' })).toHaveAttribute(
      'href',
      'mailto:hello@learnandgrow.in',
    )
    expect(screen.getByRole('link', { name: /\+919876543210/ })).toHaveAttribute('href', 'https://wa.me/919876543210')
    expect(screen.getByRole('link', { name: sample.phone })).toHaveAttribute('href', `tel:${sample.phone.replace(/[^\d+]/g, '')}`)
    expect(screen.getByRole('link', { name: /get directions/i })).toHaveAttribute('href', sample.directionsUrl)
  })

  it('contact page has exactly one h1', () => {
    render(<ContactPage />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
