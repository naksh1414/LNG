// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSessionToken } from '@/lib/auth/session'
import { createBook, getBookById } from '@/lib/books/repo'
import type { BookInput } from '@/lib/books/types'
import { getDb } from '@/lib/db/mongo'
import { DELETE, PATCH } from './[id]/route'
import { GET, POST } from './route'

const revalidatePath = vi.hoisted(() => vi.fn())
vi.mock('next/cache', () => ({ revalidatePath }))

let server: MongoMemoryServer
let cookie: string

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-admin-books-test'
  process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long'
  cookie = `lng_admin=${await createSessionToken('507f1f77bcf86cd799439011')}`
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  await (await getDb()).collection('books').deleteMany({})
  revalidatePath.mockClear()
}, 120000)

const input: BookInput = {
  title: 'Seed to Tree',
  subtitle: 'A first nature book',
  author: 'A. Writer',
  subject: 'Nature',
  ageMin: 3,
  ageMax: 6,
  description: 'Watch a seed grow.',
  coverUrl: null,
  coverAlt: '',
  featured: false,
  published: true,
}

type Opts = { body?: unknown; auth?: boolean; origin?: string }
const req = (method: string, path: string, { body, auth = true, origin }: Opts = {}) =>
  new Request(`http://admin.test${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(auth && { cookie }),
      ...(origin && { origin }),
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  })
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

describe('/api/admin/books', () => {
  it('every /api/admin/books method returns 401 without a session', async () => {
    const book = await createBook(input)
    const statuses = [
      (await GET(req('GET', '/api/admin/books', { auth: false }))).status,
      (await POST(req('POST', '/api/admin/books', { body: input, auth: false }))).status,
      (await PATCH(req('PATCH', `/api/admin/books/${book.id}`, { body: input, auth: false }), ctx(book.id))).status,
      (await DELETE(req('DELETE', `/api/admin/books/${book.id}`, { auth: false }), ctx(book.id))).status,
    ]
    expect(statuses).toEqual([401, 401, 401, 401])
    expect(await getBookById(book.id)).not.toBeNull()
  })

  it('GET lists every book, published or not', async () => {
    await createBook(input)
    await createBook({ ...input, title: 'Hidden', published: false })
    const res = await GET(req('GET', '/api/admin/books'))
    expect(res.status).toBe(200)
    expect((await res.json()).books).toHaveLength(2)
  })

  it('POST creates a book and returns 201', async () => {
    const res = await POST(req('POST', '/api/admin/books', { body: input, origin: 'http://admin.test' }))
    expect(res.status).toBe(201)
    const { book } = await res.json()
    expect(book).toMatchObject({ title: 'Seed to Tree', slug: 'seed-to-tree' })
    expect(await getBookById(book.id)).not.toBeNull()
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/catalog')
    expect(revalidatePath).toHaveBeenCalledWith('/books/[slug]', 'page')
  })

  it('POST uses a manual slug for a non-Latin title', async () => {
    const res = await POST(req('POST', '/api/admin/books', { body: { ...input, title: 'पेड़', slug: 'ped' } }))
    expect((await res.json()).book.slug).toBe('ped')
  })

  it('invalid body returns 400 with field errors', async () => {
    const res = await POST(req('POST', '/api/admin/books', { body: { ...input, title: '', ageMin: 9, ageMax: 4 } }))
    expect(res.status).toBe(400)
    const { fields } = await res.json()
    expect(fields.title).toEqual(expect.any(String))
    expect(fields.ageMax).toEqual(expect.any(String))
    const bad = await POST(new Request('http://admin.test/api/admin/books', { method: 'POST', headers: { cookie }, body: '{' }))
    expect(bad.status).toBe(400)
  })

  it('rejects a cross-origin write with 403', async () => {
    const res = await POST(req('POST', '/api/admin/books', { body: input, origin: 'https://evil.example' }))
    expect(res.status).toBe(403)
    expect(await (await getDb()).collection('books').countDocuments()).toBe(0)
  })

  it('PATCH updates a book', async () => {
    const book = await createBook(input)
    const res = await PATCH(req('PATCH', `/api/admin/books/${book.id}`, { body: { ...input, published: false } }), ctx(book.id))
    expect(res.status).toBe(200)
    expect((await getBookById(book.id))?.published).toBe(false)
    expect(revalidatePath).toHaveBeenCalledWith('/catalog')
  })

  it('PATCH of an unknown id returns 404', async () => {
    for (const id of ['507f1f77bcf86cd799439011', 'not-an-id']) {
      expect((await PATCH(req('PATCH', `/api/admin/books/${id}`, { body: input }), ctx(id))).status).toBe(404)
    }
  })

  it('PATCH to a slug another book uses returns 409 with a slug field error', async () => {
    await createBook({ ...input, title: 'Taken' })
    const book = await createBook(input)
    const res = await PATCH(req('PATCH', `/api/admin/books/${book.id}`, { body: { ...input, slug: 'taken' } }), ctx(book.id))
    expect(res.status).toBe(409)
    expect((await res.json()).fields.slug).toMatch(/already/i)
  })

  it('DELETE removes the book', async () => {
    const book = await createBook(input)
    const res = await DELETE(req('DELETE', `/api/admin/books/${book.id}`), ctx(book.id))
    expect(res.status).toBe(200)
    expect(await getBookById(book.id)).toBeNull()
    expect((await DELETE(req('DELETE', `/api/admin/books/${book.id}`), ctx(book.id))).status).toBe(404)
  })
})
