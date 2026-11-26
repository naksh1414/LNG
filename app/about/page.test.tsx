import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeBook } from '@/components/home/fixtures'
import AboutPage from './page'

vi.mock('@/lib/books/repo', () => ({
  listPublishedBooks: vi.fn(async () => [makeBook('Seed Book', 'Nature'), makeBook('Word Book', 'Language')]),
}))

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
afterEach(() => vi.unstubAllGlobals())

describe('about page', () => {
  it('about page keeps its heading and renders inside the shell', async () => {
    render(await AboutPage())
    const h1s = screen.getAllByRole('heading', { level: 1 })
    expect(h1s).toHaveLength(1)
    expect(h1s[0]).toHaveTextContent('Books for the way children wonder.')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Small things, thoughtfully made.' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'A message from our founder' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'What we publish' })).toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/[\u2013\u2014]|01 \//)
  })
})
