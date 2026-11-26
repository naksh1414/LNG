// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { signInAs } from '@/tests/admin-session'
import { createBook } from '@/lib/books/repo'
import { getDb } from '@/lib/db/mongo'
import { listAudit } from '@/lib/audit/repo'
import { listAdminSeries } from '@/lib/series/repo'
import { POST } from './route'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

let server: MongoMemoryServer
let cookie: string

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-admin-series-test'
  process.env.SESSION_SECRET = 't'.repeat(40)
  cookie = (await signInAs()).cookie
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('series').deleteMany({})
  await db.collection('books').deleteMany({})
  await db.collection('audit_log').deleteMany({})
}, 120000)

const post = (body: unknown, auth = true) =>
  POST(
    new Request('http://admin.test/api/admin/series', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(auth && { cookie }) },
      body: JSON.stringify(body),
    }),
  )

describe('/api/admin/series', () => {
  it('needs a session, a name, and refuses a duplicate name', async () => {
    expect((await post({ name: 'A', description: '' }, false)).status).toBe(401)
    expect((await post({ name: '  ', description: '' })).status).toBe(400)
    expect((await post({ name: 'Dreamscape', description: 'Art' })).status).toBe(201)
    const { entries } = await listAudit(1, 5)
    expect(entries[0]).toMatchObject({ action: 'series_created', targetLabel: 'Dreamscape' })
    expect((await post({ name: 'dreamscape', description: '' })).status).toBe(409)
  })

  it('lists saved series and series only used by books', async () => {
    await post({ name: 'Empty one', description: '' })
    await createBook({
      title: 'T', subtitle: '', author: 'A', series: 'Old series', subject: 'Art', classLevel: 'Class 1',
      ageMin: 3, ageMax: 6, description: '', coverUrl: null, coverAlt: '', featured: false, published: true,
    })
    const list = await listAdminSeries()
    expect(list.map((s) => [s.slug, s.books.length])).toEqual([['empty-one', 0], ['old-series', 1]])
  })
})
