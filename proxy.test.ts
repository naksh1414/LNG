// @vitest-environment node
import { NextRequest } from 'next/server'
import { beforeAll, describe, expect, it } from 'vitest'
import { createSessionToken } from '@/lib/auth/session'
import { config, proxy } from './proxy'

beforeAll(() => {
  process.env.SESSION_SECRET = 't'.repeat(40)
})

const req = (path: string, init: { method?: string; cookie?: string } = {}) =>
  new NextRequest(`http://localhost${path}`, {
    method: init.method ?? 'GET',
    headers: init.cookie ? { cookie: init.cookie } : {},
  })
const passed = (res: Response) => res.headers.get('x-middleware-next') === '1'

describe('proxy', () => {
  it('matches admin pages and admin api routes', () => {
    expect(config.matcher).toEqual(['/admin/:path*', '/api/admin/:path*'])
  })

  it('redirects /admin/books to /admin/login without a cookie', async () => {
    for (const path of ['/admin/books', '/admin']) {
      const res = await proxy(req(path))
      expect(res.status).toBe(307)
      expect(new URL(res.headers.get('location')!).pathname).toBe('/admin/login')
    }
  })

  it('returns 401 for /api/admin/books without a cookie', async () => {
    const res = await proxy(req('/api/admin/books'))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Not signed in.' })
    // Only POST to the login route is public.
    expect((await proxy(req('/api/admin/login'))).status).toBe(401)
    expect((await proxy(req('/api/admin/logout', { method: 'POST' }))).status).toBe(401)
  })

  it('returns 401 for a tampered cookie', async () => {
    const token = await createSessionToken('abc')
    const tampered = `${token.slice(0, -2)}xx`
    expect((await proxy(req('/api/admin/books', { cookie: `lng_admin=${tampered}` }))).status).toBe(401)
    expect((await proxy(req('/admin/books', { cookie: `lng_admin=${tampered}` }))).status).toBe(307)
  })

  it('allows /admin/login', async () => {
    expect(passed(await proxy(req('/admin/login')))).toBe(true)
    expect(passed(await proxy(req('/api/admin/login', { method: 'POST' })))).toBe(true)
  })

  it('allows the page with a valid cookie', async () => {
    const cookie = `lng_admin=${await createSessionToken('abc')}`
    expect(passed(await proxy(req('/admin/books', { cookie })))).toBe(true)
    expect(passed(await proxy(req('/api/admin/books', { cookie })))).toBe(true)
  })
})
