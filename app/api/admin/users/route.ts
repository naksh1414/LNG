import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { audit } from '@/lib/audit/log'
import { createAdmin } from '@/lib/auth/admins-repo'
import { hashPassword, passwordPolicy } from '@/lib/auth/password'
import { toPublic } from '@/lib/auth/public-admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { roleExists } from '@/lib/auth/roles-repo'
import { forbidden, serverError } from '@/lib/books/admin-api'
import { isCrossOrigin } from '@/lib/request'

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.').max(254)),
  role: z.string().trim().min(1, 'Choose a role.').max(64),
  password: z.string().max(1024),
})

export async function POST(request: Request): Promise<Response> {
  const auth = await requireAdmin(request, 'users', 'write')
  if (auth instanceof Response) return auth
  if (isCrossOrigin(request)) return forbidden()
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    const fields = Object.fromEntries(Object.entries(z.flattenError(parsed.error).fieldErrors).map(([k, v]) => [k, (v as string[])[0]]))
    return Response.json({ error: 'Check the highlighted fields.', fields }, { status: 400 })
  }
  const { email, role, password } = parsed.data
  if (!(await roleExists(role))) return Response.json({ error: 'Check the highlighted fields.', fields: { role: 'Choose a role.' } }, { status: 400 })
  const weak = passwordPolicy(password)
  if (weak) return Response.json({ error: 'Check the highlighted fields.', fields: { password: weak } }, { status: 400 })
  try {
    const admin = await createAdmin(email, await hashPassword(password), role)
    await audit(request, auth, 'user_created', { type: 'user', id: admin.id, label: `${admin.email} (${role})` })
    revalidatePath('/admin/users')
    return Response.json({ user: toPublic(admin) }, { status: 201 })
  } catch (err) {
    // 11000: the unique index on email.
    if ((err as { code?: number }).code === 11000) {
      return Response.json({ error: 'Check the highlighted fields.', fields: { email: 'An admin with this email already exists.' } }, { status: 409 })
    }
    return serverError('create user', err)
  }
}
