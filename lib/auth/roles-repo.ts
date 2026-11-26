import { ObjectId, type WithId } from 'mongodb'
import { getDb } from '@/lib/db/mongo'
import { AREAS, BUILTIN, GRANTABLE, isBuiltin, noAccess, type Permissions } from './roles'

export type CustomRole = { id: string; name: string; permissions: Permissions; createdAt: string }

type RoleDoc = { name: string; nameKey: string; permissions: Partial<Permissions>; createdAt: Date }

const roles = async () => (await getDb()).collection<RoleDoc>('roles')
const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null)
export const nameKeyOf = (name: string) => name.trim().toLowerCase()

// Only grantable areas are kept, so a stored role can never carry users access even if a row was edited by hand.
function clean(p: Partial<Permissions>): Permissions {
  const out = noAccess()
  for (const a of AREAS) if (GRANTABLE.includes(a) && p[a]) out[a] = p[a]!
  return out
}

const toRole = ({ _id, name, permissions, createdAt }: WithId<RoleDoc>): CustomRole => ({
  id: _id.toHexString(),
  name,
  permissions: clean(permissions),
  createdAt: createdAt.toISOString(),
})

export async function listRoles(): Promise<CustomRole[]> {
  return (await (await roles()).find({}).sort({ nameKey: 1 }).toArray()).map(toRole)
}

export async function findRole(id: string): Promise<CustomRole | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await roles()).findOne({ _id })
  return doc && toRole(doc)
}

// Built-in names are reserved, so a custom role cannot pose as one.
export const nameTaken = (name: string): boolean => isBuiltin(nameKeyOf(name))

export async function createRole(name: string, permissions: Partial<Permissions>): Promise<CustomRole> {
  const doc: RoleDoc = { name: name.trim(), nameKey: nameKeyOf(name), permissions: clean(permissions), createdAt: new Date() }
  const { insertedId } = await (await roles()).insertOne(doc)
  return toRole({ _id: insertedId, ...doc })
}

export async function updateRole(id: string, changes: { name?: string; permissions?: Partial<Permissions> }): Promise<CustomRole | null> {
  const _id = oid(id)
  if (!_id) return null
  const set: Partial<RoleDoc> = {}
  if (changes.name !== undefined) Object.assign(set, { name: changes.name.trim(), nameKey: nameKeyOf(changes.name) })
  if (changes.permissions) set.permissions = clean(changes.permissions)
  const doc = await (await roles()).findOneAndUpdate({ _id }, { $set: set }, { returnDocument: 'after' })
  return doc && toRole(doc)
}

export async function deleteRole(id: string): Promise<CustomRole | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await roles()).findOneAndDelete({ _id })
  return doc && toRole(doc)
}

// A deleted role leaves its users with no access (dashboard and Change password only), never with more.
export async function describeRole(key: string): Promise<{ name: string; permissions: Permissions }> {
  if (isBuiltin(key)) return { name: BUILTIN[key].label, permissions: BUILTIN[key].permissions }
  const role = await findRole(key)
  return role ? { name: role.name, permissions: role.permissions } : { name: 'No role', permissions: noAccess() }
}

export async function roleExists(key: string): Promise<boolean> {
  return isBuiltin(key) || (await findRole(key)) !== null
}
