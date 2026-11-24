import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let pathname = '/'
vi.mock('next/navigation', () => ({ usePathname: () => pathname }))

import { AnalyticsTracker } from './analytics-tracker'

const fetchMock = vi.fn()
const bodies = () => fetchMock.mock.calls.map((c) => JSON.parse(c[1].body))

beforeEach(() => {
  pathname = '/'
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('AnalyticsTracker', () => {
  it('sends page_view on mount and on route change', () => {
    const { rerender } = render(<AnalyticsTracker />)
    expect(bodies()).toEqual([{ type: 'page_view', path: '/' }])
    pathname = '/catalog'
    rerender(<AnalyticsTracker />)
    expect(bodies().at(-1)).toEqual({ type: 'page_view', path: '/catalog' })
  })

  it('sends book_view as well on a book page', () => {
    pathname = '/books/owl'
    render(<AnalyticsTracker />)
    expect(bodies().map((b) => b.type)).toEqual(['page_view', 'book_view'])
  })

  it('uses sendBeacon when available', () => {
    const beacon = vi.fn().mockReturnValue(true)
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: beacon })
    render(<AnalyticsTracker />)
    expect(beacon).toHaveBeenCalledWith('/api/events', expect.any(Blob))
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does nothing on /admin paths', () => {
    pathname = '/admin/books'
    render(<AnalyticsTracker />)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does nothing when doNotTrack is 1', () => {
    vi.stubGlobal('navigator', { ...navigator, doNotTrack: '1' })
    render(<AnalyticsTracker />)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
