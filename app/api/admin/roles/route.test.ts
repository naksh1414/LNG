// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { GET as listBooks, POST as createBook } from '@/app/api/admin/books/route'
import { POST as createUser } from '@/app/api/admin/users/route'
import { getDb } from '@/lib/db/mongo'
import { signInAs } from '@/tests/admin-session'
import { DELETE, PATCH } from './[id]/route'
import { POST } from './route'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }))

const STRONG = 'p'.repeat(14)

let server: MongoMemoryServer
let owner: { id: string; cookie: string }

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-admin-roles-test'
  process.env.SESSION_SECRET = 't'.repeat(40)
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('admins').deleteMany({})
  await db.collection('roles').deleteMany({})
  await db.collection('audit_log').deleteMany({})
  owner = await signInAs('owner')
}, 120000)

const json = (cookie: string, method: string, body?: unknown) => ({
  method,
  headers: { 'content-type': 'application/json', cookie },
  body: body === undefined ? undefined : JSON.stringify(body),
})
const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const mkRole = (body: unknown, cookie = owner.cookie) => POST(new Request('http://admin.test/api/admin/roles', json(cookie, 'POST', body)))
const patchRole = (id: string, body: unknown) => PATCH(new Request(`http://admin.test/api/admin/roles/${id}`, json(owner.cookie, 'PATCH', body)), ctx(id))
const delRole = (id: string) => DELETE(new Request(`http://admin.test/api/admin/roles/${id}`, json(owner.cookie, 'DELETE')), ctx(id))
const tryCreateBook = (cookie: string) => createBook(new Request('http://admin.test/api/admin/books', json(cookie, 'POST', {})))
const tryListBooks = (cookie: string) => listBooks(new Request('http://admin.test/api/admin/books', { headers: { cookie } }))

describe('custom roles', () => {
  it('only the owner can add roles; names and permissions are validated', async () => {
    const editor = await signInAs('editor')
    expect((await mkRole({ name: 'Auditor', permissions: { audit: 'read' } }, editor.cookie)).status).toBe(403)

    expect((await mkRole({ name: ' ', permissions: {} })).status).toBe(400)
    // users cannot be granted, and metrics and the audit log cannot be written
    expect((await mkRole({ name: 'Boss', permissions: { users: 'write' } })).status).toBe(400)
    expect((await mkRole({ name: 'Boss', permissions: { metrics: 'write' } })).status).toBe(400)
    expect((await mkRole({ name: 'Owner', permissions: {} })).status).toBe(409)

    const res = await mkRole({ name: 'Auditor', permissions: { audit: 'read', metrics: 'read' } })
    expect(res.status).toBe(201)
    expect((await res.json()).role.permissions).toMatchObject({ audit: 'read', metrics: 'read', catalog: 'none', users: 'none' })
    expect((await mkRole({ name: 'auditor', permissions: {} })).status).toBe(409)
  })

  it('a custom role gets exactly the access it is given, and edits apply on the next request', async () => {
    const role = (await (await mkRole({ name: 'Reader', permissions: { catalog: 'read' } })).json()).role
    const created = await createUser(new Request('http://admin.test/api/admin/users', json(owner.cookie, 'POST', { email: 'r@example.com', role: role.id, password: STRONG })))
    expect(created.status).toBe(201)
    const { createSessionToken } = await import('@/lib/auth/session')
    const cookie = `lng_admin=${await createSessionToken((await created.json()).user.id)}`

    expect((await tryListBooks(cookie)).status).toBe(200)
    expect((await tryCreateBook(cookie)).status).toBe(403)

    expect((await patchRole(role.id, { permissions: { catalog: 'write' } })).status).toBe(200)
    expect((await tryCreateBook(cookie)).status).toBe(400) // allowed in, then rejected as an empty book

    expect((await patchRole(role.id, { permissions: { catalog: 'none' } })).status).toBe(200)
    expect((await tryListBooks(cookie)).status).toBe(403)
  })

  it('refuses unknown roles, blocks deleting a role in use, and a deleted role leaves no access', async () => {
    const bad = await createUser(new Request('http://admin.test/api/admin/users', json(owner.cookie, 'POST', { email: 'x@example.com', role: '507f1f77bcf86cd799439011', password: STRONG })))
    expect(bad.status).toBe(400)

    const role = (await (await mkRole({ name: 'Reader', permissions: { catalog: 'read' } })).json()).role
    const user = (await (await createUser(new Request('http://admin.test/api/admin/users', json(owner.cookie, 'POST', { email: 'r@example.com', role: role.id, password: STRONG })))).json()).user
    expect((await delRole(role.id)).status).toBe(409)

    // Simulates a role removed behind the app's back: the user falls to no access, never to more.
    await (await getDb()).collection('roles').deleteMany({})
    const { createSessionToken } = await import('@/lib/auth/session')
    expect((await tryListBooks(`lng_admin=${await createSessionToken(user.id)}`)).status).toBe(403)
    expect((await delRole('507f1f77bcf86cd799439011')).status).toBe(404)
  })
})
