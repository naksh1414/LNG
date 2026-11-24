import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FeaturedBooks } from './featured-books'
import { makeBook } from './fixtures'

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

describe('FeaturedBooks', () => {
  it('featured books renders nothing for an empty list', () => {
    const { container } = render(<FeaturedBooks books={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('links every featured book to its page', () => {
    render(<FeaturedBooks books={[makeBook('Big One'), makeBook('Small One'), makeBook('Small Two')]} />)
    expect(screen.getByRole('link', { name: /Big One/ })).toHaveAttribute('href', '/books/big-one')
    expect(screen.getByRole('link', { name: /Small Two/ })).toHaveAttribute('href', '/books/small-two')
  })
})
