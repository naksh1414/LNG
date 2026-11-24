import { NextResponse } from 'next/server'
import { z } from 'zod'
import { findAdminByEmail } from '@/lib/auth/admins-repo'
import { DUMMY_HASH, verifyPassword } from '@/lib/auth/password'
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session'
import { audit } from '@/lib/audit/log'
import { hit } from '@/lib/rate-limit'
import { clientIp } from '@/lib/request'

const FIFTEEN_MINUTES = 15 * 60 * 1000

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1).max(254),
  password: z.string().min(1).max(1024),
})

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Enter your email and password.' }, { status: 400 })
  const { email, password } = parsed.data

  // Every attempt counts and the check runs before the password is compared, so a locked
  // out caller cannot learn whether a guess was right. Fails closed: no limiter, no login.
  try {
    const { allowed } = await hit(`login:${clientIp(request.headers)}:${email}`, 5, FIFTEEN_MINUTES)
    if (!allowed) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  } catch {
    console.error('admin login: rate limit check failed')
    return Response.json({ error: 'Sign in is unavailable. Try again shortly.' }, { status: 503 })
  }

  try {
    const admin = await findAdminByEmail(email)
    const ok = await verifyPassword(password, admin?.passwordHash ?? DUMMY_HASH)
    if (!admin || !ok) {
      await audit(request, { adminId: admin?.id ?? null, email }, 'login_failed')
      return Response.json({ error: 'Wrong email or password.' }, { status: 401 })
    }
    await audit(request, { adminId: admin.id, email: admin.email }, 'login_success')

    const res = NextResponse.json({ ok: true })
    res.cookies.set(SESSION_COOKIE, await createSessionToken(admin.id), sessionCookieOptions)
    return res
  } catch (err) {
    console.error('admin login: failed:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'Sign in is unavailable. Try again shortly.' }, { status: 500 })
  }
}
