import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Book } from '@/lib/books/types'
import { CatalogClient } from './catalog-client'

const replace = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace, push: vi.fn() }) }))
beforeEach(() => replace.mockClear())

const make = (title: string, author: string, subject: string): Book => ({
  id: title,
  title,
  subtitle: '',
  author,
  slug: title.toLowerCase().replace(/ /g, '-'),
  series: 'Series',
  classLevel: 'Class 1',
  subject,
  ageMin: 3,
  ageMax: 6,
  description: '',
  coverUrl: null,
  coverAlt: '',
  featured: false,
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const books = [make('Seed Book', 'Ada Reed', 'Nature'), make('Word Book', 'Samira Cole', 'Language')]
const subjects = ['Language', 'Nature']
const base = { books, subjects, q: '', page: 1, totalPages: 1, total: 2, catalogTotal: 2 }

describe('CatalogClient', () => {
  it('shows the page it is given and counts from the server total', () => {
    render(<CatalogClient {...base} />)
    expect(screen.getByRole('link', { name: /Seed Book/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Word Book/ })).toBeInTheDocument()
    expect(screen.getByText('Showing 1 to 2 of 2 titles')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
  })

  it('subject chips are links that keep the search, and the active one is marked', () => {
    render(<CatalogClient {...base} subject="Language" q="word" total={1} books={[books[1]]} />)
    expect(screen.getByRole('link', { name: 'Language' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'All books' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Nature' })).toHaveAttribute('href', '/catalog?subject=Nature&q=word')
    expect(screen.getByRole('link', { name: 'All books' })).toHaveAttribute('href', '/catalog?q=word')
    expect(screen.getByText('1 title', { exact: false })).toBeInTheDocument()
  })

  it('pagination links to the neighbouring pages and marks the current one', () => {
    render(<CatalogClient {...base} subject="Nature" page={3} totalPages={7} total={80} />)
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(screen.getByText('Showing 17 to 18 of 80 titles')).toBeInTheDocument()
    expect(nav.querySelector('a[rel="prev"]')).toHaveAttribute('href', '/catalog?subject=Nature&page=2#all-books')
    expect(nav.querySelector('a[rel="next"]')).toHaveAttribute('href', '/catalog?subject=Nature&page=4#all-books')
    expect(screen.getByRole('link', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('href', '/catalog?subject=Nature#all-books')
  })

  it('typing waits for a pause, then puts one search in the URL and resets to page 1', async () => {
    render(<CatalogClient {...base} subject="Nature" page={4} totalPages={9} total={100} />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search books' }), 'owl')
    expect(replace).not.toHaveBeenCalled()
    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1), { timeout: 2000 })
    expect(replace).toHaveBeenCalledWith('/catalog?subject=Nature&q=owl', { scroll: false })
  })

  it('shows the empty states, and the clear link goes back to the whole catalogue', () => {
    const { unmount } = render(<CatalogClient {...base} books={[]} total={0} catalogTotal={0} />)
    expect(screen.getByText('No books yet')).toBeInTheDocument()
    unmount()
    render(<CatalogClient {...base} books={[]} total={0} q="zzzz" />)
    expect(screen.getByText('No books found')).toBeInTheDocument()
    expect(screen.getByText('0 titles')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search books' })).toHaveValue('zzzz')
    expect(screen.getByRole('link', { name: /clear filters/i })).toHaveAttribute('href', '/catalog')
  })
})
