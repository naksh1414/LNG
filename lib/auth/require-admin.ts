import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session'

// Every /api/admin/* route calls this first; proxy.ts is not the only gate.
export async function requireAdmin(request: Request): Promise<{ adminId: string } | Response> {
  const prefix = `${SESSION_COOKIE}=`
  const token = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix))
    ?.slice(prefix.length)
  const session = await readSessionToken(token)
  return session ?? Response.json({ error: 'Not signed in.' }, { status: 401 })
}

// For admin server pages: proxy.ts redirects too, but each page checks for itself.
export async function requireAdminPage(): Promise<{ adminId: string }> {
  const session = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) redirect('/admin/login')
  return session
}
