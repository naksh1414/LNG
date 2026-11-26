import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BookPage from '@/app/books/[slug]/page'
import CatalogPage from '@/app/catalog/page'
import HomePage from '@/app/page'
import { makeBook } from '@/components/home/fixtures'
import type { Book } from '@/lib/books/types'

// vi.mock is hoisted; the factory reads books lazily, after this module has evaluated.
const withCover = (b: Book): Book => ({
  ...b,
  coverUrl: `https://x.public.blob.vercel-storage.com/${b.slug}.jpg`,
  coverAlt: `Cover of ${b.title}`,
})
const books = ['Seed Book', 'Word Book', 'Sky Book', 'Hand Book', 'Wild Book'].map((t, i) =>
  withCover(makeBook(t, i % 2 ? 'Language' : 'Nature')),
)

vi.mock('@/lib/books/repo', () => ({
  listPublishedBooks: vi.fn(async () => books),
  listSubjects: vi.fn(async () => ['Language', 'Nature']),
  searchPublishedBooks: vi.fn(async () => ({ books, total: books.length })),
  getPublishedBookBySlug: vi.fn(async (slug: string) => books.find((b) => b.slug === slug) ?? null),
}))

vi.mock('@/lib/testimonials/repo', () => ({ listTestimonials: vi.fn(async () => []) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }), usePathname: () => '/', redirect: vi.fn() }))
vi.mock('@/lib/series/repo', () => ({ listSeriesLogos: vi.fn(async () => ({})) }))

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
  cleanup()
  vi.unstubAllGlobals()
})

const pages = {
  home: async () => render(await HomePage()),
  catalogue: async () => render(await CatalogPage({ searchParams: Promise.resolve({}) })),
  book: async () => render(await BookPage({ params: Promise.resolve({ slug: books[0].slug }) })),
}

describe.each(Object.entries(pages))('%s page a11y', (_, renderPage) => {
  it('has exactly one h1', async () => {
    await renderPage()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('labels every input', async () => {
    const { container } = await renderPage()
    const fields = [...screen.queryAllByRole('textbox'), ...screen.queryAllByRole('searchbox')]
    for (const el of fields) expect(el).toHaveAccessibleName()
    // Every label must point at a form control, not at another element sharing its id.
    for (const label of container.querySelectorAll('label[for]')) {
      const target = document.getElementById(label.getAttribute('for')!)
      expect(target?.tagName, `label for=${label.getAttribute('for')}`).toMatch(/^(INPUT|TEXTAREA|SELECT)$/)
    }
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([])
  })

  it('gives every interactive element a visible focus class', async () => {
    const { container } = await renderPage()
    const interactive = [
      ...screen.queryAllByRole('link'),
      ...screen.queryAllByRole('button'),
      ...screen.queryAllByRole('textbox'),
      ...screen.queryAllByRole('searchbox'),
      ...container.querySelectorAll('summary'),
    ]
    expect(interactive.length).toBeGreaterThan(0)
    for (const el of interactive) {
      expect(el.className, el.outerHTML.slice(0, 120)).toMatch(/focus-visible:outline-(2|\[)/)
      expect(el.className).not.toMatch(/(^|\s)(focus:)?outline-none/)
    }
  })

  it('gives every image an alt attribute', async () => {
    const { container } = await renderPage()
    const imgs = [...container.querySelectorAll('img')]
    expect(imgs.length).toBeGreaterThan(0)
    for (const img of imgs) expect(img.hasAttribute('alt')).toBe(true)
  })
})

describe('performance markup', () => {
  it('home page html has no h-screen class', async () => {
    const { container } = await pages.home()
    expect(container.innerHTML).not.toMatch(/\bh-screen\b/)
    expect(container.innerHTML).toContain('100dvh')
  })

  it('home: no cover is above the fold, so every image is lazy', async () => {
    const { container } = await pages.home()
    const imgs = [...container.querySelectorAll('img')]
    expect(imgs.length).toBeGreaterThan(0)
    for (const img of imgs) expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('catalogue: every image is lazy', async () => {
    const { container } = await pages.catalogue()
    for (const img of container.querySelectorAll('img')) expect(img).toHaveAttribute('loading', 'lazy')
  })

  it('book page: the single cover is eager', async () => {
    const { container } = await pages.book()
    const imgs = container.querySelectorAll('img:not([src*="logo"])')
    expect(imgs).toHaveLength(1)
    expect(imgs[0].getAttribute('loading')).not.toBe('lazy')
  })
})
