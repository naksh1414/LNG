// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { createBook, searchPublishedBooks } from './repo'
import type { BookInput } from './types'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-search-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

const input = (i: number, over: Partial<BookInput> = {}): BookInput => ({
  title: `Book ${String(i).padStart(2, '0')}`,
  subtitle: '',
  author: 'Ada Reed',
  slug: `book-${i}`,
  series: 'S',
  subject: i % 2 ? 'Nature' : 'Language',
  classLevel: 'Class 1',
  ageMin: 3,
  ageMax: 6,
  description: 'd',
  coverUrl: null,
  coverAlt: '',
  featured: false,
  published: true,
  ...over,
})

beforeEach(async () => {
  await (await getDb()).collection('books').deleteMany({})
  for (let i = 1; i <= 25; i++) await createBook(input(i))
  await createBook(input(99, { title: 'Hidden Draft', slug: 'hidden', published: false }))
}, 120000)

describe('searchPublishedBooks', () => {
  it('returns one page at a time with the true total, in a stable order, and never drafts', async () => {
    const p1 = await searchPublishedBooks({ page: 1, pageSize: 10 })
    const p3 = await searchPublishedBooks({ page: 3, pageSize: 10 })
    expect(p1.total).toBe(25)
    expect(p1.books).toHaveLength(10)
    expect(p1.books[0].title).toBe('Book 01')
    expect(p3.books.map((b) => b.title)).toEqual(['Book 21', 'Book 22', 'Book 23', 'Book 24', 'Book 25'])
    expect((await searchPublishedBooks({ page: 4, pageSize: 10 })).books).toEqual([])
  })

  it('filters by subject and by a case-insensitive search, counting only the matches', async () => {
    const nature = await searchPublishedBooks({ subject: 'Nature', page: 1, pageSize: 50 })
    expect(nature.total).toBe(13)
    expect(nature.books.every((b) => b.subject === 'Nature')).toBe(true)
    expect((await searchPublishedBooks({ q: 'BOOK 07', page: 1, pageSize: 10 })).books.map((b) => b.title)).toEqual(['Book 07'])
    expect((await searchPublishedBooks({ q: 'ada', page: 1, pageSize: 5 })).total).toBe(25)
  })

  it('treats the search as plain text, not a pattern', async () => {
    expect((await searchPublishedBooks({ q: '.*', page: 1, pageSize: 10 })).total).toBe(0)
    expect((await searchPublishedBooks({ q: '(', page: 1, pageSize: 10 })).total).toBe(0)
  })
})
