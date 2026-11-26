import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { findAdminById } from '@/lib/auth/admins-repo'
import { describeRole } from '@/lib/auth/roles-repo'
import { can, type Area, type Permissions } from '@/lib/auth/roles'
import { readSessionToken, SESSION_COOKIE } from '@/lib/auth/session'

export type AdminSession = { adminId: string; email: string; role: string; roleName: string; permissions: Permissions }

// The session cookie only proves who someone is. The admin and their role's permissions are read from the
// database on every request, so a disabled, deleted or demoted user, or an edited role, takes effect at once.
async function resolve(token: string | undefined): Promise<AdminSession | null> {
  const session = await readSessionToken(token)
  if (!session) return null
  const admin = await findAdminById(session.adminId)
  if (!admin?.active) return null
  const { name, permissions } = await describeRole(admin.role)
  return { adminId: admin.id, email: admin.email, role: admin.role, roleName: name, permissions }
}

// For the admin layout: who is signed in (and still allowed), or null.
export async function currentAdmin(): Promise<AdminSession | null> {
  return resolve((await cookies()).get(SESSION_COOKIE)?.value)
}

// Every /api/admin/* route calls this first; proxy.ts is not the only gate.
// No area: any signed-in admin (logout, own password). With an area: needs that read or write level.
export async function requireAdmin(request: Request, area?: Area, level: 'read' | 'write' = 'read'): Promise<AdminSession | Response> {
  const prefix = `${SESSION_COOKIE}=`
  const token = request.headers
    .get('cookie')
    ?.split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix))
    ?.slice(prefix.length)
  const admin = await resolve(token)
  if (!admin) return Response.json({ error: 'Not signed in.' }, { status: 401 })
  if (area && !can(admin.permissions, area, level)) return Response.json({ error: 'You do not have access to this.' }, { status: 403 })
  return admin
}

// For admin server pages: proxy.ts redirects too, but each page checks for itself.
// Someone signed in without the access goes back to the dashboard, which every admin can open.
export async function requireAdminPage(area?: Area, level: 'read' | 'write' = 'read'): Promise<AdminSession> {
  const admin = await resolve((await cookies()).get(SESSION_COOKIE)?.value)
  if (!admin) redirect('/admin/login')
  if (area && !can(admin.permissions, area, level)) redirect('/admin')
  return admin
}
