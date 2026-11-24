import { NextResponse, type NextRequest } from 'next/server'
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session'

// JWT check only (jose): no bcrypt, no Mongo here. Routes re-check with requireAdmin.
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  if (pathname === '/admin/login' || (pathname === '/api/admin/login' && request.method === 'POST')) {
    return NextResponse.next()
  }
  if (await readSessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next()
  if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
