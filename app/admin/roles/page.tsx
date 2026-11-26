import type { Metadata } from 'next'
import { RoleManager } from '@/components/admin/role-manager'
import { requireAdminPage } from '@/lib/auth/require-admin'
import { BUILTIN, BUILTIN_KEYS, summarize } from '@/lib/auth/roles'
import { listRoles } from '@/lib/auth/roles-repo'

export const metadata: Metadata = { title: 'Roles' }
export const dynamic = 'force-dynamic'

export default async function AdminRolesPage() {
  await requireAdminPage('users', 'write')
  const custom = await listRoles()
  const builtin = BUILTIN_KEYS.map((k) => ({ key: k, label: BUILTIN[k].label, summary: summarize(BUILTIN[k].permissions) }))
  return (
    <>
      <h1 className="text-3xl font-extrabold tracking-[-0.03em] text-foreground">Roles</h1>
      <p className="mt-1 mb-8 text-sm text-muted-foreground">
        Decide who can see and change what. Changes to a role apply to its users on their next click. Assign roles on the Users page.
      </p>
      <RoleManager initial={custom} builtin={builtin} />
    </>
  )
}
