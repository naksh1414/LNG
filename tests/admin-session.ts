import { ObjectId } from 'mongodb'
import { createSessionToken } from '@/lib/auth/session'
import { getDb } from '@/lib/db/mongo'

// A real admin row plus a signed cookie, because requireAdmin reads the admin from the database.
// Call it again after a test wipes the admins collection.
export async function signInAs(role = 'owner', email = `${role}@example.com`): Promise<{ id: string; cookie: string }> {
  const _id = new ObjectId()
  await (await getDb()).collection('admins').insertOne({ _id, email, passwordHash: 'x', role, active: true, createdAt: new Date() })
  const id = _id.toHexString()
  return { id, cookie: `lng_admin=${await createSessionToken(id)}` }
}
