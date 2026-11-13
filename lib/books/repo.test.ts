// @vitest-environment node
import { Collection } from 'mongodb'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import type { BookInput } from '@/lib/books/types'
import {
  createBook,
  deleteBook,
  getBookById,
  getPublishedBookBySlug,
  listAllBooks,
  listPublishedBooks,
  listSubjects,
  updateBook,
} from './repo'

const base: BookInput = {
  title: 'The Quiet Observer',
  subtitle: 'Noticing',
  author: 'Mira Ellison',
  subject: 'Nature',
  ageMin: 3,
  ageMax: 6,
  description: 'd',
  coverUrl: null,
  coverAlt: '',
  featured: false,
  published: true,
}

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  await (await getDb()).collection('books').deleteMany({})
}, 120000)

describe('book repository', () => {
  it('createBook assigns a unique slug and timestamps', async () => {
    const book = await createBook(base)
    expect(book.slug).toBe('the-quiet-observer')
    expect(typeof book.id).toBe('string')
    expect(new Date(book.createdAt).toISOString()).toBe(book.createdAt)
    expect(book.updatedAt).toBe(book.createdAt)
    expect(await getBookById(book.id)).toEqual(book)
  })

  it('two books with the same title get -2 slug', async () => {
    const a = await createBook(base)
    const b = await createBook(base)
    expect(a.slug).toBe('the-quiet-observer')
    expect(b.slug).toBe('the-quiet-observer-2')
  })

  it('createBook retries with a new slug when the insert hits a duplicate key', async () => {
    const col = (await getDb()).collection('books')
    const real = Collection.prototype.insertOne
    let first = true
    // Simulate a concurrent writer taking the slug just after the existence check.
    const spy = vi.spyOn(Collection.prototype, 'insertOne').mockImplementation(async function (this: Collection, ...args) {
      if (first) {
        first = false
        await real.call(this, { slug: 'the-quiet-observer', published: true, subject: 'x' })
      }
      return real.apply(this, args)
    })
    let book
    try {
      book = await createBook(base)
    } finally {
      spy.mockRestore()
    }
    expect(book.slug).toBe('the-quiet-observer-2')
    expect(await col.countDocuments({})).toBe(2)
  })

  it('listPublishedBooks hides unpublished books', async () => {
    await createBook(base)
    await createBook({ ...base, title: 'Draft', published: false })
    expect((await listPublishedBooks()).map((b) => b.title)).toEqual(['The Quiet Observer'])
    expect(await listAllBooks()).toHaveLength(2)
  })

  it('getPublishedBookBySlug returns null for unpublished', async () => {
    const draft = await createBook({ ...base, title: 'Draft', published: false })
    const live = await createBook(base)
    expect(await getPublishedBookBySlug(draft.slug)).toBeNull()
    expect(await getPublishedBookBySlug('missing')).toBeNull()
    expect((await getPublishedBookBySlug(live.slug))?.id).toBe(live.id)
  })

  it('updateBook returns null for an unknown id', async () => {
    expect(await updateBook('64b7f0f0f0f0f0f0f0f0f0f0', base)).toBeNull()
    expect(await updateBook('not-an-id', base)).toBeNull()
  })

  it('updateBook changes fields and bumps updatedAt', async () => {
    const book = await createBook(base)
    await new Promise((r) => setTimeout(r, 10))
    const next = await updateBook(book.id, { ...base, title: 'Renamed', slug: book.slug })
    expect(next?.title).toBe('Renamed')
    expect(next?.slug).toBe(book.slug)
    expect(next?.createdAt).toBe(book.createdAt)
    expect(new Date(next!.updatedAt).getTime()).toBeGreaterThan(new Date(book.updatedAt).getTime())
  })

  it('deleteBook removes the book', async () => {
    const book = await createBook(base)
    expect(await deleteBook(book.id)).toBe(true)
    expect(await getBookById(book.id)).toBeNull()
    expect(await deleteBook(book.id)).toBe(false)
    expect(await deleteBook('not-an-id')).toBe(false)
  })

  it('listSubjects derives from published books only', async () => {
    await createBook({ ...base, subject: 'Nature' })
    await createBook({ ...base, title: 'B', subject: 'Language' })
    await createBook({ ...base, title: 'C', subject: 'Nature' })
    await createBook({ ...base, title: 'D', subject: 'Secret', published: false })
    expect(await listSubjects()).toEqual(['Language', 'Nature'])
  })

  it('two module imports share one Mongo client', async () => {
    vi.resetModules()
    const a = await import('@/lib/db/mongo')
    vi.resetModules()
    const b = await import('@/lib/db/mongo')
    expect(a).not.toBe(b)
    expect((await a.getDb()).client).toBe((await b.getDb()).client)
  })
})
