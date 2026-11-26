// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST as login } from '@/app/api/admin/login/route'
import { GET as listBooks, POST as createBook } from '@/app/api/admin/books/route'
import { PATCH as markRead } from '@/app/api/admin/enquiries/[id]/route'
import { findAdminByEmail } from '@/lib/auth/admins-repo'
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
  process.env.MONGODB_DB = 'lng-admin-users-test'
  process.env.SESSION_SECRET = 't'.repeat(40)
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('admins').deleteMany({})
  await db.collection('rate_limits').deleteMany({})
  owner = await signInAs('owner')
}, 120000)

const call = (handler: (r: Request, c: never) => Promise<Response>, method: string, body: unknown, cookie: string | null = owner.cookie, id = 'x') =>
  handler(
    new Request(`http://admin.test/api/admin/users/${id}`, {
      method,
      headers: { 'content-type': 'application/json', ...(cookie && { cookie }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ id }) } as never,
  )
const create = (body: unknown, cookie: string | null = owner.cookie) => call(POST as never, 'POST', body, cookie)
const good = { email: 'New.Staff@Example.com', role: 'editor', password: STRONG }

describe('admin users', () => {
  it('only an owner can create users; input is validated and duplicates refused', async () => {
    expect((await create(good, null)).status).toBe(401)
    const editor = await signInAs('editor')
    expect((await create(good, editor.cookie)).status).toBe(403)
    expect((await create({ ...good, email: 'nope' })).status).toBe(400)
    expect((await create({ ...good, role: 'god' })).status).toBe(400)
    expect((await create({ ...good, password: 'short' })).status).toBe(400)

    const res = await create(good)
    expect(res.status).toBe(201)
    const { user } = await res.json()
    expect(user).toMatchObject({ email: 'new.staff@example.com', role: 'editor', active: true })
    expect(user.passwordHash).toBeUndefined()
    expect((await create(good)).status).toBe(409)
  })

  it('roles gate the other admin routes: viewer reads only, editor edits content, only the owner sees enquiries', async () => {
    const viewer = await signInAs('viewer')
    const editor = await signInAs('editor')
    const bookBody = (cookie: string) => new Request('http://admin.test/api/admin/books', { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: '{}' })
    expect((await createBook(bookBody(viewer.cookie))).status).toBe(403)
    expect((await createBook(bookBody(editor.cookie))).status).toBe(400) // allowed in, then rejected as an empty book
    const list = (cookie: string) => listBooks(new Request('http://admin.test/api/admin/books', { headers: { cookie } }))
    expect((await list(viewer.cookie)).status).toBe(200)
    expect((await list(editor.cookie)).status).toBe(200)
    const read = (cookie: string) =>
      markRead(new Request('http://admin.test/api/admin/enquiries/x', { method: 'PATCH', headers: { 'content-type': 'application/json', cookie }, body: '{"read":true}' }), { params: Promise.resolve({ id: 'x' }) })
    expect((await read(viewer.cookie)).status).toBe(403)
    expect((await read(editor.cookie)).status).toBe(403)
    expect((await read(owner.cookie)).status).toBe(404)
  })

  it('a disabled or deleted user is locked out at once, and cannot sign in', async () => {
    const created = (await (await create({ ...good, email: 'ed@example.com' })).json()).user
    const { cookie } = { cookie: `lng_admin=${(await import('@/lib/auth/session').then((m) => m.createSessionToken(created.id)))}` }
    const probe = () => createBook(new Request('http://admin.test/api/admin/books', { method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: '{}' }))
    expect((await probe()).status).toBe(400)

    expect((await call(PATCH as never, 'PATCH', { active: false }, owner.cookie, created.id)).status).toBe(200)
    expect((await probe()).status).toBe(401)
    const attempt = await login(new Request('http://admin.test/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': '9.9.9.9' }, body: JSON.stringify({ email: 'ed@example.com', password: STRONG }) }))
    expect(attempt.status).toBe(403)

    expect((await call(PATCH as never, 'PATCH', { active: true, role: 'viewer' }, owner.cookie, created.id)).status).toBe(200)
    expect((await probe()).status).toBe(403)
    expect((await call(DELETE as never, 'DELETE', undefined, owner.cookie, created.id)).status).toBe(200)
    expect((await probe()).status).toBe(401)
    expect(await findAdminByEmail('ed@example.com')).toBeNull()
  })

  it('an owner cannot change, disable, reset or delete their own account; a password reset works for others', async () => {
    expect((await call(PATCH as never, 'PATCH', { role: 'viewer' }, owner.cookie, owner.id)).status).toBe(400)
    expect((await call(PATCH as never, 'PATCH', { active: false }, owner.cookie, owner.id)).status).toBe(400)
    expect((await call(PATCH as never, 'PATCH', { password: STRONG }, owner.cookie, owner.id)).status).toBe(400)
    expect((await call(DELETE as never, 'DELETE', undefined, owner.cookie, owner.id)).status).toBe(400)

    const other = (await (await create(good)).json()).user
    expect((await call(PATCH as never, 'PATCH', { password: 'short' }, owner.cookie, other.id)).status).toBe(400)
    expect((await call(PATCH as never, 'PATCH', { password: 'q'.repeat(14) }, owner.cookie, other.id)).status).toBe(200)
    expect((await call(PATCH as never, 'PATCH', { role: 'viewer' }, owner.cookie, '507f1f77bcf86cd799439011')).status).toBe(404)
  })
})
