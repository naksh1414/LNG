// Shared by server and client code: no Mongo or bcrypt in here.
export const AREAS = ['catalog', 'testimonials', 'enquiries', 'metrics', 'audit', 'users'] as const
export type Area = (typeof AREAS)[number]
export type Level = 'none' | 'read' | 'write'
export type Permissions = Record<Area, Level>

export const AREA_LABEL: Record<Area, string> = {
  catalog: 'Series and books',
  testimonials: 'Testimonials',
  enquiries: 'Enquiries',
  metrics: 'Metrics',
  audit: 'Audit log',
  users: 'Users and roles',
}

// What write means where it is not obvious. Metrics and the audit log can only be read.
export const WRITE_MEANS: Partial<Record<Area, string>> = {
  catalog: 'add, edit and delete series and books, upload images',
  testimonials: 'add, edit, hide and delete',
  enquiries: 'mark as read or new',
}

// Custom roles can be given these. Users and roles stay with the owner, so nobody can hand themselves more power.
export const GRANTABLE: readonly Area[] = ['catalog', 'testimonials', 'enquiries', 'metrics', 'audit']

export const levelsFor = (area: Area): Level[] => (area in WRITE_MEANS ? ['none', 'read', 'write'] : ['none', 'read'])

const RANK: Record<Level, number> = { none: 0, read: 1, write: 2 }
export const can = (p: Permissions, area: Area, level: 'read' | 'write' = 'read'): boolean => RANK[p[area]] >= RANK[level]

export const noAccess = (): Permissions => Object.fromEntries(AREAS.map((a) => [a, 'none'])) as Permissions
const grant = (levels: Partial<Permissions>): Permissions => ({ ...noAccess(), ...levels })

// Built-in roles are fixed; their keys are stored on the admin as is. Custom roles are stored by id.
export const BUILTIN = {
  owner: {
    label: 'Owner',
    hint: 'Everything, including users, roles and the audit log.',
    permissions: grant({ catalog: 'write', testimonials: 'write', enquiries: 'write', metrics: 'read', audit: 'read', users: 'write' }),
  },
  editor: {
    label: 'Editor',
    hint: 'Add and edit series, books and testimonials.',
    permissions: grant({ catalog: 'write', testimonials: 'write' }),
  },
  viewer: {
    label: 'Viewer',
    hint: 'See series and books, read only.',
    permissions: grant({ catalog: 'read' }),
  },
} as const

export type BuiltinKey = keyof typeof BUILTIN
export const isBuiltin = (key: string): key is BuiltinKey => Object.hasOwn(BUILTIN, key)
export const BUILTIN_KEYS = Object.keys(BUILTIN) as BuiltinKey[]

// One line per area the role can use, for role pickers.
export function summarize(p: Permissions): string {
  const parts = AREAS.filter((a) => p[a] !== 'none').map((a) => `${AREA_LABEL[a]} (${p[a]})`)
  return parts.length ? parts.join(', ') : 'Dashboard and Change password only.'
}

export type RoleOption = { key: string; label: string; hint: string }
