import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Book } from '@/lib/books/types'
import { BookCover } from './book-cover'

const book: Book = {
  id: '1',
  title: 'The Shape of a Seed',
  subtitle: 's',
  author: 'Ada Reed',
  slug: 'the-shape-of-a-seed',
  series: 'Series', classLevel: 'Class 1', subject: 'Nature',
  ageMin: 4,
  ageMax: 8,
  description: 'd',
  coverUrl: null,
  coverAlt: 'Cover of The Shape of a Seed',
  featured: false,
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('BookCover', () => {
  it('renders a text cover when coverUrl is null and an image with alt text otherwise', () => {
    const { rerender } = render(<BookCover book={book} />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText('The Shape of a Seed')).toBeInTheDocument()
    expect(screen.getByText('Ada Reed')).toBeInTheDocument()

    rerender(<BookCover book={{ ...book, coverUrl: 'https://x.public.blob.vercel-storage.com/c.jpg' }} />)
    expect(screen.getByRole('img', { name: 'Cover of The Shape of a Seed' })).toBeInTheDocument()
  })
})
