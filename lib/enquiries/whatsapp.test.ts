import { describe, expect, it } from 'vitest'
import { buildWhatsAppUrl, normalizeNumber } from './whatsapp'

describe('whatsapp', () => {
  it('normalizeNumber strips spaces, plus and dashes', () => {
    expect(normalizeNumber('+91 98765-43210')).toBe('919876543210')
  })

  it('normalizeNumber returns null for too short, letters and undefined', () => {
    expect(normalizeNumber('1234567')).toBeNull()
    expect(normalizeNumber('98765abc4321')).toBeNull()
    expect(normalizeNumber(undefined)).toBeNull()
    expect(normalizeNumber('1234567890123456')).toBeNull()
  })

  it('buildWhatsAppUrl encodes the message with line breaks and quotes', () => {
    const url = buildWhatsAppUrl('+91 98765 43210', {
      name: 'Asha',
      contact: 'a@b.in',
      message: 'Hi\nthere',
      bookTitle: 'The "Owl"',
    })!
    expect(url.startsWith('https://wa.me/919876543210?text=')).toBe(true)
    const text = decodeURIComponent(url.split('?text=')[1])
    expect(text).toBe('Hello Learn and Grow, I am Asha (a@b.in).\nI am asking about "The "Owl"".\n\nHi\nthere')
    expect(url).toContain('%0A')
    expect(url).toContain('%22')
  })

  it('buildWhatsAppUrl omits the book line without a title', () => {
    const url = buildWhatsAppUrl('919876543210', { name: 'A', contact: 'c', message: 'm' })!
    expect(decodeURIComponent(url.split('?text=')[1])).toBe('Hello Learn and Grow, I am A (c).\n\nm')
  })

  it('buildWhatsAppUrl returns null for an invalid number', () => {
    expect(buildWhatsAppUrl('abc', { name: 'A', contact: 'c', message: 'm' })).toBeNull()
    expect(buildWhatsAppUrl(undefined, { name: 'A', contact: 'c', message: 'm' })).toBeNull()
  })
})
