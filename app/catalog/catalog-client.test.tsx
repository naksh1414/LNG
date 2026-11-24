import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Book } from '@/lib/books/types'
import { CatalogClient } from './catalog-client'

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

describe('CatalogClient', () => {
  it('filters by subject chip', async () => {
    render(<CatalogClient books={books} subjects={subjects} />)
    expect(screen.getByRole('button', { name: 'All books' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(screen.getByRole('button', { name: 'Nature' }))
    expect(screen.getByRole('button', { name: 'Nature' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: /Seed Book/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Word Book/ })).toBeNull()
    expect(screen.getByText('1 title')).toBeInTheDocument()
  })

  it('catalogue honors ?subject= as the initial filter', () => {
    render(<CatalogClient books={books} subjects={subjects} initialSubject="Language" />)
    expect(screen.getByRole('button', { name: 'Language' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: /Word Book/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Seed Book/ })).toBeNull()
  })

  it('ignores an unknown ?subject= and shows all books', () => {
    render(<CatalogClient books={books} subjects={subjects} initialSubject="Nope" />)
    expect(screen.getByRole('button', { name: 'All books' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('filters by search text across title, author and subject', async () => {
    render(<CatalogClient books={books} subjects={subjects} />)
    const box = screen.getByRole('searchbox', { name: 'Search books' })
    await userEvent.type(box, 'samira')
    expect(screen.queryByRole('link', { name: /Seed Book/ })).toBeNull()
    expect(screen.getByRole('link', { name: /Word Book/ })).toBeInTheDocument()
    await userEvent.clear(box)
    await userEvent.type(box, 'nature')
    expect(screen.getByRole('link', { name: /Seed Book/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Word Book/ })).toBeNull()
    await userEvent.clear(box)
    await userEvent.type(box, 'word')
    expect(screen.getByRole('link', { name: /Word Book/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Seed Book/ })).toBeNull()
  })

  it('shows the empty state with zero books and with no match, and clearing restores the list', async () => {
    const { unmount } = render(<CatalogClient books={[]} subjects={[]} />)
    expect(screen.getByText('No books yet')).toBeInTheDocument()
    unmount()

    render(<CatalogClient books={books} subjects={subjects} />)
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search books' }), 'zzzz')
    expect(screen.getByText('No books found')).toBeInTheDocument()
    expect(screen.getByText('0 titles')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(screen.getByRole('link', { name: /Seed Book/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Word Book/ })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search books' })).toHaveValue('')
  })
})
