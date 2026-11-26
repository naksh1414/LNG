import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { requireAdmin } from '@/lib/auth/require-admin'
import { nameSchema, permissionsSchema } from '@/lib/auth/role-schema'
import { createRole, nameTaken } from '@/lib/auth/roles-repo'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'

const schema = z.object({ name: nameSchema, permissions: permissionsSchema })

// Roles are owner only: users: write is not grantable to a custom role.
export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request, 'users', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fields = Object.fromEntries(Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
    return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
  }
  const { name, permissions } = parsed.data
  if (nameTaken(name)) return Response.json({ error: 'Check the highlighted fields.', fields: { name: 'That name is used by a built-in role.' } }, { status: 409 })
  try {
    const role = await createRole(name, permissions)
    await audit(request, auth, 'role_created', { type: 'role', id: role.id, label: role.name })
    revalidatePath('/admin/roles')
    return Response.json({ role }, { status: 201 })
  } catch (err) {
    // 11000: the unique index on the lowercased name.
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: 'Check the highlighted fields.', fields: { name: 'A role with this name already exists.' } }, { status: 409 })
    }
    return serverError('create role', err)
  }
}
