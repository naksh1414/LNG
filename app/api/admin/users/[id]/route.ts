import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { deleteAdmin, findAdminById, setPasswordHash, updateAdmin } from '@/lib/auth/admins-repo'
import { hashPassword, passwordPolicy } from '@/lib/auth/password'
import { toPublic } from '@/lib/auth/public-admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { roleExists } from '@/lib/auth/roles-repo'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'

type Ctx = { params: Promise<{ id: string }> }
const notFound = () => Response.json({ error: 'User not found.' }, { status: 404 })
// Nobody can lock themselves out, so an active owner always remains: the one making the change.
const selfRefused = (what: string) => Response.json({ error: `You cannot ${what} your own account. Ask another owner.` }, { status: 400 })

const schema = z.object({ role: z.string().trim().min(1).max(64).optional(), active: z.boolean().optional(), password: z.string().max(1024).optional() })

export async function PATCH(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'users', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid request.' }, { status: 400 })
  const { role, active, password } = parsed.data
  const { id } = await params
  if (id === auth.adminId) {
    if (role !== undefined || active !== undefined) return selfRefused('change the role or status of')
    if (password !== undefined) return Response.json({ error: 'Change your own password from Change password.' }, { status: 400 })
  }
  try {
    if (role !== undefined && !(await roleExists(role))) return Response.json({ error: 'That role does not exist.' }, { status: 400 })
    if (!(await findAdminById(id))) return notFound()
    if (password !== undefined) {
      const weak = passwordPolicy(password)
      if (weak) return Response.json({ error: weak }, { status: 400 })
      await setPasswordHash(id, await hashPassword(password))
    }
    const changes = { ...(role !== undefined && { role }), ...(active !== undefined && { active }) }
    const user = Object.keys(changes).length ? await updateAdmin(id, changes) : await findAdminById(id)
    if (!user) return notFound()
    if (password !== undefined) await audit(request, auth, 'user_password_reset', { type: 'user', id, label: user.email })
    if (Object.keys(changes).length) {
      await audit(request, auth, 'user_updated', { type: 'user', id, label: `${user.email}: ${user.role}, ${user.active ? 'active' : 'disabled'}` })
    }
    revalidatePath('/admin/users')
    return Response.json({ user: toPublic(user) })
  } catch (err) {
    return serverError('update user', err)
  }
}

export async function DELETE(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'users', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const { id } = await params
  if (id === auth.adminId) return selfRefused('delete')
  try {
    const user = await deleteAdmin(id)
    if (!user) return notFound()
    await audit(request, auth, 'user_deleted', { type: 'user', id, label: user.email })
    revalidatePath('/admin/users')
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('delete user', err)
  }
}
