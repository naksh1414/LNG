import type { Metadata } from 'next'
import { UserManager } from '@/components/admin/user-manager'
import { listAdmins } from '@/lib/auth/admins-repo'
import { toPublic } from '@/lib/auth/public-admin'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { BUILTIN, BUILTIN_KEYS, summarize, type RoleOption } from '@/lib/auth/roles'
import { listRoles } from '@/lib/auth/roles-repo'

export const metadata: Metadata = { title: 'Users' }
export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const me = await requireAdminPage('users', 'write')
  const [admins, custom] = await Promise.all([listAdmins(), listRoles()])
  const users = admins.map(toPublic)
  const roles: RoleOption[] = [
    ...BUILTIN_KEYS.map((k) => ({ key: k, label: BUILTIN[k].label, hint: BUILTIN[k].hint })),
    ...custom.map((r) => ({ key: r.id, label: r.name, hint: summarize(r.permissions) })),
  ]
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Users</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        People who can sign in to this admin panel. Turning a user off or changing their role takes effect on their next click.
      </p>
      <UserManager initial={users} meId={me.adminId} roles={roles} />
    </>
  )
}
