// @vitest-environment node
import { MongoMemoryServer } from 'mongodb-memory-server'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdmin } from '@/lib/auth/admins-repo'
import { hashPassword } from '@/lib/auth/password'
import { readSessionToken } from '@/lib/auth/session'
import { getDb } from '@/lib/db/mongo'
import * as limiter from '@/lib/rate-limit'
import { POST } from './route'

let server: MongoMemoryServer
let adminId: string

beforeAll(async () => {
  server = await MongoMemoryServer.create()
  process.env.MONGODB_URI = server.getUri()
  process.env.MONGODB_DB = 'lng-login-test'
  process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long'
  const db = await getDb()
  await db.collection('admins').deleteMany({})
  adminId = (await createAdmin('owner@example.com', await hashPassword('right-password-1'))).id
}, 120000)

afterAll(async () => {
  await (await getDb()).client.close()
  await server.stop()
})

beforeEach(async () => {
  await (await getDb()).collection('rate_limits').deleteMany({})
}, 120000)

afterEach(() => vi.restoreAllMocks())

const login = (body: unknown, ip = '1.2.3.4') =>
  POST(
    new Request('http://x/api/admin/login', {
      method: 'POST',
      headers: { 'x-real-ip': ip, 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  )

describe('POST /api/admin/login', () => {
  it('correct credentials set an HttpOnly cookie', async () => {
    const res = await login({ email: 'Owner@Example.com', password: 'right-password-1' })
    expect(res.status).toBe(200)
    const cookie = res.headers.get('set-cookie')!
    expect(cookie).toMatch(/^lng_admin=/)
    expect(cookie).toMatch(/HttpOnly/i)
    expect(cookie).toMatch(/SameSite=lax/i)
    expect(cookie).toMatch(/Path=\//)
    expect(cookie).toMatch(/Max-Age=604800/)
    expect(cookie).not.toMatch(/Secure/i) // NODE_ENV is test
    const token = cookie.split(';')[0].slice('lng_admin='.length)
    expect(await readSessionToken(token)).toEqual({ adminId })
  })

  it('wrong password and unknown email return the same 401 body', async () => {
    const wrong = await login({ email: 'owner@example.com', password: 'wrong-password-1' })
    const unknown = await login({ email: 'nobody@example.com', password: 'right-password-1' })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
    expect(await wrong.json()).toEqual(await unknown.json())
    expect(wrong.headers.get('set-cookie')).toBeNull()
  })

  it('invalid body returns 400', async () => {
    expect((await login('not json')).status).toBe(400)
    expect((await login({ email: 'owner@example.com' })).status).toBe(400)
  })

  it('sixth failed attempt returns 429', async () => {
    for (let i = 0; i < 5; i++) expect((await login({ email: 'owner@example.com', password: 'nope-nope-1' })).status).toBe(401)
    // Locked even with the right password.
    const res = await login({ email: 'owner@example.com', password: 'right-password-1' })
    expect(res.status).toBe(429)
    expect(res.headers.get('set-cookie')).toBeNull()
    // Another IP is not locked out.
    expect((await login({ email: 'owner@example.com', password: 'right-password-1' }, '5.6.7.8')).status).toBe(200)
  })

  it('successful login does not reset the lockout counter for other emails', async () => {
    for (let i = 0; i < 5; i++) await login({ email: 'other@example.com', password: 'nope-nope-1' })
    expect((await login({ email: 'owner@example.com', password: 'right-password-1' })).status).toBe(200)
    expect((await login({ email: 'other@example.com', password: 'nope-nope-1' })).status).toBe(429)
  })

  it('fails closed when the rate limiter is down', async () => {
    vi.spyOn(limiter, 'hit').mockRejectedValue(new Error('down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await login({ email: 'owner@example.com', password: 'right-password-1' })
    expect(res.status).toBe(503)
    expect(res.headers.get('set-cookie')).toBeNull()
  })
})
