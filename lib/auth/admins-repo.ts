import { ObjectId, type WithId } from 'mongodb'
import { getDb } from '@/lib/db/mongo'

export type Admin = { id: string; email: string; passwordHash: string }

type AdminDoc = { email: string; passwordHash: string; createdAt: Date }

async function admins() {
  return (await getDb()).collection<AdminDoc>('admins')
}

// Emails are stored lowercased, so lookups are case-insensitive and the unique index holds.
const normalize = (email: string) => email.trim().toLowerCase()

const toAdmin = (d: WithId<AdminDoc>): Admin => ({ id: d._id.toHexString(), email: d.email, passwordHash: d.passwordHash })

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  const doc = await (await admins()).findOne({ email: normalize(email) })
  return doc && toAdmin(doc)
}

export async function findAdminById(id: string): Promise<Admin | null> {
  if (!ObjectId.isValid(id)) return null
  const doc = await (await admins()).findOne({ _id: new ObjectId(id) })
  return doc && toAdmin(doc)
}

export async function createAdmin(email: string, passwordHash: string): Promise<Admin> {
  const doc = { email: normalize(email), passwordHash, createdAt: new Date() }
  const { insertedId } = await (await admins()).insertOne(doc)
  return toAdmin({ _id: insertedId, ...doc })
}

export async function setPasswordHash(id: string, hash: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false
  const { matchedCount } = await (await admins()).updateOne({ _id: new ObjectId(id) }, { $set: { passwordHash: hash } })
  return matchedCount === 1
}

export async function countAdmins(): Promise<number> {
  return (await admins()).countDocuments({})
}
