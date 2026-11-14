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
