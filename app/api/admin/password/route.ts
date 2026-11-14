import { z } from 'zod'
import { findAdminById, setPasswordHash } from '@/lib/auth/admins-repo'
import { hashPassword, passwordPolicy, verifyPassword } from '@/lib/auth/password'
import { requireAdmin } from '@/lib/auth/require-admin'
import { hit } from '@/lib/rate-limit'

const FIFTEEN_MINUTES = 15 * 60 * 1000

const changeSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z.string().max(1024),
})

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request)
  if (auth instanceof Response) return auth

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = changeSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Enter your current and new password.' }, { status: 400 })
  const { currentPassword, newPassword } = parsed.data

  // A stolen session must not be able to guess the current password freely. Fails closed.
  try {
    const { allowed } = await hit(`password:${auth.adminId}`, 5, FIFTEEN_MINUTES)
    if (!allowed) return Response.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  } catch {
    console.error('admin password: rate limit check failed')
    return Response.json({ error: 'Could not change the password. Try again shortly.' }, { status: 503 })
  }

  try {
    const admin = await findAdminById(auth.adminId)
    if (!admin) return Response.json({ error: 'Not signed in.' }, { status: 401 })
    if (!(await verifyPassword(currentPassword, admin.passwordHash))) {
      return Response.json({ error: 'The current password is wrong.' }, { status: 400 })
    }
    const policyError = passwordPolicy(newPassword)
    if (policyError) return Response.json({ error: policyError }, { status: 400 })
    await setPasswordHash(admin.id, await hashPassword(newPassword))
    return Response.json({ ok: true })
  } catch (err) {
    console.error('admin password: failed:', err instanceof Error ? err.message : 'unknown error')
    return Response.json({ error: 'Could not change the password. Try again shortly.' }, { status: 500 })
  }
}
