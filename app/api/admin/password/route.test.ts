// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createAdmin, findAdminById } from '@/lib/auth/admins-repo'
import { hashPassword, verifyPassword } from '@/lib/auth/password'
import { createSessionToken } from '@/lib/auth/session'
import { getDb } from '@/lib/db/mongo'
import { POST } from './route'

let server: MongoMemoryServer
let adminId: string
let cookie: string

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-password-test'
  process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long'
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  const db = await getDb()
  await db.collection('admins').deleteMany({})
  await db.collection('rate_limits').deleteMany({})
  adminId = (await createAdmin('owner@example.com', await hashPassword('old-password-1'))).id
  cookie = `lng_admin=${await createSessionToken(adminId)}`
}, 120000)

const change = (body: unknown, c: string | null = cookie) =>
  POST(
    new Request('http://x/api/admin/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-real-ip': '1.2.3.4', ...(c && { cookie: `theme=x; ${c}` }) },
      body: JSON.stringify(body),
    }),
  )

describe('POST /api/admin/password', () => {
  it('returns 401 without a session or with a tampered one', async () => {
    const body = { currentPassword: 'old-password-1', newPassword: 'new-password-1' }
    expect((await change(body, null)).status).toBe(401)
    expect((await change(body, `${cookie.slice(0, -2)}xx`)).status).toBe(401)
  })

  it('rejects a wrong current password', async () => {
    const res = await change({ currentPassword: 'wrong-password', newPassword: 'new-password-1' })
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/current password/i)
    expect(await verifyPassword('old-password-1', (await findAdminById(adminId))!.passwordHash)).toBe(true)
  })

  it('rejects a weak new password', async () => {
    const res = await change({ currentPassword: 'old-password-1', newPassword: 'short' })
    expect(res.status).toBe(400)
    expect(await verifyPassword('old-password-1', (await findAdminById(adminId))!.passwordHash)).toBe(true)
  })

  it('accepts a valid change', async () => {
    const res = await change({ currentPassword: 'old-password-1', newPassword: 'new-password-1' })
    expect(res.status).toBe(200)
    const hash = (await findAdminById(adminId))!.passwordHash
    expect(await verifyPassword('new-password-1', hash)).toBe(true)
    expect(await verifyPassword('old-password-1', hash)).toBe(false)
  })

  it('locks out after 5 wrong current passwords', async () => {
    for (let i = 0; i < 5; i++) await change({ currentPassword: 'wrong-password', newPassword: 'new-password-1' })
    expect((await change({ currentPassword: 'old-password-1', newPassword: 'new-password-1' })).status).toBe(429)
  })
})
