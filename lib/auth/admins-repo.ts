import { ObjectId, type WithId } from 'mongodb'
import { getDb } from '@/lib/db/mongo'

export type Admin = { id: string; email: string; passwordHash: string; role: string; active: boolean; createdAt: string }

// role and active are missing on admins created before roles existed: those are owners and active.
type AdminDoc = { email: string; passwordHash: string; role?: string; active?: boolean; createdAt: Date }

async function admins() {
  return (await getDb()).collection<AdminDoc>('admins')
}

// Emails are stored lowercased, so lookups are case-insensitive and the unique index holds.
const normalize = (email: string) => email.trim().toLowerCase()

const toAdmin = (d: WithId<AdminDoc>): Admin => ({
  id: d._id.toHexString(),
  email: d.email,
  passwordHash: d.passwordHash,
  role: d.role ?? 'owner',
  active: d.active ?? true,
  createdAt: d.createdAt.toISOString(),
})

const oid = (id: string) => (ObjectId.isValid(id) ? new ObjectId(id) : null)

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const doc = await (await admins()).findOne({ email: normalize(email) })
  return doc && toAdmin(doc)
}

export async function findAdminById(id: string): Promise<Admin | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await admins()).findOne({ _id })
  return doc && toAdmin(doc)
}

export async function createAdmin(email: string, passwordHash: string, role = 'owner'): Promise<Admin> {
  const doc = { email: normalize(email), passwordHash, role, active: true, createdAt: new Date() }
  const { insertedId } = await (await admins()).insertOne(doc)
  return toAdmin({ _id: insertedId, ...doc })
}

export async function listAdmins(): Promise<Admin[]> {
  return (await (await admins()).find({}).sort({ createdAt: 1, _id: 1 }).toArray()).map(toAdmin)
}

export async function updateAdmin(id: string, changes: { role?: string; active?: boolean }): Promise<Admin | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await admins()).findOneAndUpdate({ _id }, { $set: changes }, { returnDocument: 'after' })
  return doc && toAdmin(doc)
}

export async function deleteAdmin(id: string): Promise<Admin | null> {
  const _id = oid(id)
  if (!_id) return null
  const doc = await (await admins()).findOneAndDelete({ _id })
  return doc && toAdmin(doc)
}

export async function setPasswordHash(id: string, hash: string): Promise<boolean> {
  const _id = oid(id)
  if (!_id) return false
  const { matchedCount } = await (await admins()).updateOne({ _id }, { $set: { passwordHash: hash } })
  return matchedCount === 1
}

export async function countAdminsWithRole(role: string): Promise<number> {
  return (await admins()).countDocuments({ role })
}

export async function countAdmins(): Promise<number> {
  return (await admins()).countDocuments({})
}
