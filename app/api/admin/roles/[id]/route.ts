import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { countAdminsWithRole } from '@/lib/auth/admins-repo'
import { requireAdmin } from '@/lib/auth/require-admin'
import { nameSchema, permissionsSchema } from '@/lib/auth/role-schema'
import { deleteRole, nameTaken, updateRole } from '@/lib/auth/roles-repo'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'

type Ctx = { params: Promise<{ id: string }> }
const notFound = () => Response.json({ error: 'Role not found.' }, { status: 404 })
const schema = z.object({ name: nameSchema.optional(), permissions: permissionsSchema.optional() })

export async function PATCH(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'users', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fields = Object.fromEntries(Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
    return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
  }
  const { name, permissions } = parsed.data
  if (name !== undefined && nameTaken(name)) return Response.json({ error: 'Check the highlighted fields.', fields: { name: 'That name is used by a built-in role.' } }, { status: 409 })
  try {
    const role = await updateRole((await params).id, { name, permissions })
    if (!role) return notFound()
    await audit(request, auth, 'role_updated', { type: 'role', id: role.id, label: role.name })
    revalidatePath('/admin/roles')
    return Response.json({ role })
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: 'Check the highlighted fields.', fields: { name: 'A role with this name already exists.' } }, { status: 409 })
    }
    return serverError('update role', err)
  }
}

export async function DELETE(request: Request, { params }: Ctx): Promise<Response> {
  const auth = await requireAdmin(request, 'users', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const { id } = await params
  try {
    const inUse = await countAdminsWithRole(id)
    if (inUse > 0) {
      return Response.json({ error: `${inUse} ${inUse === 1 ? 'user has' : 'users have'} this role. Move them to another role first.` }, { status: 409 })
    }
    const role = await deleteRole(id)
    if (!role) return notFound()
    await audit(request, auth, 'role_deleted', { type: 'role', id, label: role.name })
    revalidatePath('/admin/roles')
    return Response.json({ ok: true })
  } catch (err) {
    return serverError('delete role', err)
  }
}
