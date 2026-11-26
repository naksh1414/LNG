// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { listAudit } from '@/lib/audit/repo'
import { signInAs } from '@/tests/admin-session'
import { getDb } from '@/lib/db/mongo'
import { listTestimonials } from '@/lib/testimonials/repo'
import { DELETE, PATCH } from './[id]/route'
import { POST } from './route'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

let server: MongoMemoryServer
let cookie: string

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-admin-testimonials-test'
  process.env.SESSION_SECRET = 't'.repeat(40)
  cookie = (await signInAs()).cookie
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('testimonials').deleteMany({})
  await db.collection('audit_log').deleteMany({})
}, 120000)

const req = (method: string, body?: unknown, auth = true) =>
  new Request('http://admin.test/api/admin/testimonials', {
    method,
    headers: { 'content-type': 'application/json', ...(auth && { cookie }) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
const good = { quote: 'Lovely books.', name: 'A parent', role: '', published: true }

describe('/api/admin/testimonials', () => {
  it('needs a session and a valid body, then creates, hides, edits and deletes with audit entries', async () => {
    expect((await POST(req('POST', good, false))).status).toBe(401)
    expect((await POST(req('POST', { ...good, quote: ' ' }))).status).toBe(400)

    const created = await POST(req('POST', good))
    expect(created.status).toBe(201)
    const { id } = (await created.json()).testimonial
    const ctx = { params: Promise.resolve({ id }) }

    expect((await PATCH(req('PATCH', { published: false }), ctx)).status).toBe(200)
    expect(await listTestimonials(true)).toHaveLength(0)
    expect((await PATCH(req('PATCH', { quote: 'x'.repeat(401) }), ctx)).status).toBe(400)

    expect((await DELETE(req('DELETE'), ctx)).status).toBe(200)
    expect((await DELETE(req('DELETE'), ctx)).status).toBe(404)
    expect((await listAudit(1, 10)).entries.map((e) => e.action)).toEqual(
      expect.arrayContaining(['testimonial_created', 'testimonial_updated', 'testimonial_deleted']),
    )
  })
})
