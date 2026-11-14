import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth/session'

// 303 so a plain HTML form post lands on the login page.
export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth
  const res = NextResponse.redirect(new URL('/admin/login', request.url), 303)
  res.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 })
  return res
}
