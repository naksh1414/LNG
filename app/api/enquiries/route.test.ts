// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { createBook } from '@/lib/books/repo'
import * as repo from '@/lib/enquiries/repo'
import * as limiter from '@/lib/rate-limit'
import { listEnquiries } from '@/lib/enquiries/repo'
import { POST } from './route'

let server: MongoMemoryServer

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-route-test'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('enquiries').deleteMany({})
  await db.collection('rate_limits').deleteMany({})
}, 120000)

afterEach(() => vi.restoreAllMocks())

const valid = { name: 'Asha', contact: 'a@b.in', message: 'Hello' }
const post = (body: unknown, ip = '1.2.3.4') =>
  POST(
    new Request('http://x/api/enquiries', {
      method: 'POST',
      headers: { 'x-forwarded-for': `${ip}, 10.0.0.1`, 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

describe('POST /api/enquiries', () => {
  it('valid body returns 201 and saves', async () => {
    const res = await post(valid)
    expect(res.status).toBe(201)
    expect(typeof (await res.json()).id).toBe('string')
    expect(await listEnquiries()).toHaveLength(1)
  })

  it('stores the book title snapshot and ignores an unknown bookId', async () => {
    const book = await createBook({
      title: 'Owl',
      subtitle: '',
      author: 'A',
      series: 'Series', classLevel: 'Class 1', subject: 'Nature',
      ageMin: 3,
      ageMax: 6,
      description: 'd',
      coverUrl: null,
      coverAlt: '',
      featured: false,
      published: true,
    })
    await post({ ...valid, bookId: book.id })
    expect((await post({ ...valid, bookId: 'zzz' })).status).toBe(201)
    const list = await listEnquiries()
    expect(list.find((e) => e.bookId === book.id)?.bookTitle).toBe('Owl')
    expect(list.find((e) => !e.bookId)?.bookTitle).toBeUndefined()
  })

  it('invalid body returns 400', async () => {
    expect((await post({ ...valid, name: '' })).status).toBe(400)
    expect((await post('not json')).status).toBe(400)
    expect(await listEnquiries()).toHaveLength(0)
  })

  it('filled honeypot returns 201 and saves nothing', async () => {
    expect((await post({ ...valid, website: 'http://spam' })).status).toBe(201)
    expect(await listEnquiries()).toHaveLength(0)
  })

  it('sixth request in an hour from one IP returns 429', async () => {
    for (let i = 0; i < 5; i++) expect((await post(valid, '9.9.9.9')).status).toBe(201)
    expect((await post(valid, '9.9.9.9')).status).toBe(429)
    expect((await post(valid, '8.8.8.8')).status).toBe(201)
  })

  it('invalid bodies and honeypot hits do not consume the rate limit', async () => {
    for (let i = 0; i < 6; i++) await post({ ...valid, name: '' }, '7.7.7.7')
    for (let i = 0; i < 6; i++) await post({ ...valid, website: 'x' }, '7.7.7.7')
    for (let i = 0; i < 5; i++) expect((await post(valid, '7.7.7.7')).status).toBe(201)
    expect((await post(valid, '7.7.7.7')).status).toBe(429)
  })

  it('still saves when the rate limiter throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(limiter, 'hit').mockRejectedValue(new Error('db down'))
    expect((await post(valid)).status).toBe(201)
    expect(await listEnquiries()).toHaveLength(1)
  })

  it('returns a clean 500 when saving throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(repo, 'createEnquiry').mockRejectedValue(new Error('secret internals'))
    const res = await post(valid)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Could not save your enquiry' })
  })
})
