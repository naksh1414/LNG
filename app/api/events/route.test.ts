// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { getDb } from '@/lib/db/mongo'
import { POST } from './route'

let server: MongoMemoryServer
const CHROME = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-events-route-test'
  process.env.SESSION_SECRET = 'test-secret'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('events').deleteMany({})
  await db.collection('rate_limits').deleteMany({})
}, 120000)

const post = (body: unknown, { ip = '1.2.3.4', ua = CHROME } = {}) =>
  POST(
    new Request('http://x/api/events', {
      method: 'POST',
      headers: { 'x-forwarded-for': ip, 'user-agent': ua, 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )
const count = async () => (await getDb()).collection('events').countDocuments()

describe('POST /api/events', () => {
  it('valid page_view returns 204 and stores one event', async () => {
    const res = await post({ type: 'page_view', path: '/catalog' })
    expect(res.status).toBe(204)
    expect(await count()).toBe(1)
    const doc = await (await getDb()).collection('events').findOne({})
    expect(doc).toMatchObject({ type: 'page_view', path: '/catalog', device: 'desktop' })
    expect(doc?.visitorHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('bot user agent stores nothing', async () => {
    expect((await post({ type: 'page_view', path: '/' }, { ua: 'Googlebot/2.1' })).status).toBe(204)
    expect(await count()).toBe(0)
  })

  it('admin path stores nothing', async () => {
    expect((await post({ type: 'page_view', path: '/admin/books' })).status).toBe(400)
    expect(await count()).toBe(0)
  })

  it('invalid body returns 400', async () => {
    expect((await post('not json')).status).toBe(400)
    expect((await post({ type: 'nope' })).status).toBe(400)
    expect((await post({ type: 'search', term: '' })).status).toBe(400)
    expect(await count()).toBe(0)
  })

  it('book_view stores a title snapshot resolved from the slug', async () => {
    const { createBook } = await import('@/lib/books/repo')
    const b = await createBook({ title: 'Owl Moon', author: 'A', subject: 'Nature', description: 'd', published: true } as never)
    expect((await post({ type: 'book_view', path: `/books/${b.slug}` })).status).toBe(204)
    expect(await (await getDb()).collection('events').findOne({})).toMatchObject({ bookId: b.id, bookTitle: 'Owl Moon' })
  })

  it('over 120 per minute returns 429', async () => {
    for (let i = 0; i < 120; i++) expect((await post({ type: 'page_view', path: '/' })).status).toBe(204)
    expect((await post({ type: 'page_view', path: '/' })).status).toBe(429)
    expect(await count()).toBe(120)
  })
})
