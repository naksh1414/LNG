import type { Book } from '@/lib/books/types'

export const makeBook = (title: string, subject = 'Nature', featured = true): Book => ({
  id: title,
  title,
  subtitle: `${title} subtitle`,
  author: 'Ada Reed',
  slug: title.toLowerCase().replace(/ /g, '-'),
  series: 'Series',
  classLevel: 'Class 1',
  subject,
  ageMin: 3,
  ageMax: 6,
  description: `${title} description`,
  coverUrl: null,
  coverAlt: '',
  featured,
  published: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})
